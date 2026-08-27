# CallRecover — Improvement Plan

Four focus areas, each scoped to concrete changes. No redesigns — additive improvements only.

---

## 1. Accurate Revenue Tracking

**Problem:** `StatsBar` (dashboard) and `Admin` both hardcode `AVG_JOB_VALUE = 350`. Every business recovers a different amount per job, so the revenue numbers are fictional.

**Changes:**
- **Migration:** Add `avg_job_value numeric DEFAULT 350 NOT NULL` column to `business_settings` (with GRANT already covered by existing table policies).
- **`src/pages/Settings.tsx`:** Add an "Average job value" number input ($). Save via existing upsert. Show helper text: "Used to calculate recovered revenue on your dashboard."
- **`src/hooks/use-leads.ts`:** Extend `useSettings` return type to include `avg_job_value`.
- **`src/components/dashboard/StatsBar.tsx`:** Accept an optional `avgJobValue` prop (default 350) and use it instead of the hardcoded constant.
- **`src/pages/Dashboard.tsx`:** Fetch settings via `useSettings()` and pass `avgJobValue` to `StatsBar`.
- **`src/pages/Admin.tsx`:** Keep the platform-wide $350 default (admin sees all businesses; per-business avg isn't aggregatable cleanly without a join — note as future enhancement).

---

## 2. Dashboard Functionality

**Problem:** The dashboard is read-only, has no filtering, no search, no notifications, and messages don't auto-scroll.

**Changes:**

### Lead search & status filter (`src/components/dashboard/LeadsList.tsx`)
- Add a search input (filter by customer name or phone number).
- Add a status filter dropdown (All / New / Engaged / Booked / Lost).
- Filter happens client-side on the already-loaded leads array.

### Manual lead status control (`ConversationView.tsx`)
- Add a small status-change control in the lead header: a dropdown or buttons to mark a lead as `booked` or `lost`.
- Calls `supabase.from("leads").update({ status }).eq("id", lead.id)` — already allowed by RLS (owners update own leads).
- Optimistic update + `queryClient.invalidateQueries(["leads"])`.

### Message auto-scroll (`ConversationView.tsx`)
- Add a `useRef` on the messages container and scroll to bottom on `messages.length` change.

### New-lead toast notification (`src/hooks/use-leads.ts` + `Dashboard.tsx`)
- In the realtime `onLeadsChange` callback, detect *new* leads (not just updates) by comparing the previous lead count to the new one.
- Fire a `toast.info("New lead from {phone}")` when a new lead appears.
- Requires passing a callback into `useLeads` or handling in `Dashboard`.

### Date-range stats (`StatsBar.tsx`)
- Add a time-range toggle: Today / 7 days / 30 days / All time.
- Filter `leads` by `created_at` before computing stats.

---

## 3. Business Hours & AI Control

**Problem:** The AI has no concept of when the business is open. Business owners can't manually intervene in a conversation.

**Changes:**

### Business hours in Settings
- **Migration:** Add `business_hours jsonb DEFAULT '{}'::jsonb` to `business_settings`. Format: `{"mon": {"open": "08:00", "close": "17:00"}, "tue": {...}, ...}`. Days absent = closed.
- **`src/pages/Settings.tsx`:** Add a compact business-hours editor (7 rows, open/close time inputs per day, checkbox to enable/disable per day).
- **`src/hooks/use-leads.ts`:** Extend settings type.

### Inject business hours into AI prompt (`supabase/functions/twilio-webhook/index.ts`)
- In `buildDefaultSystemPrompt`, append business hours context: "Business hours: Mon–Fri 8am–5pm, Sat 9am–1pm, Sun closed. If the customer asks about timing, offer slots within these hours."
- Redeploy edge function.

### Manual conversation takeover
- **Migration:** Add `human_taken_over boolean DEFAULT false` to `leads`.
- **`ConversationView.tsx`:** Add a "Take over from AI" toggle button. When enabled, sets `human_taken_over = true` on the lead.
- **`supabase/functions/twilio-webhook/index.ts`:** Before calling the AI for an inbound message, check if `lead.human_taken_over = true`. If so, do NOT auto-reply — just store the inbound message and log it. The business owner is now handling it manually.
- **Manual SMS send (edge function):** Create a new edge function `send-manual-sms` that accepts `{ leadId, body }`, verifies the caller owns the lead, sends via Twilio, and inserts the outbound message. Wire a simple text input at the bottom of `ConversationView` when `human_taken_over` is true.
- Redeploy webhook + deploy new edge function.

---

## 4. Landing Page Conversion

**Problem:** ROI Calculator is built but never rendered. No forgot-password flow. New users land on an empty dashboard with no guidance.

**Changes:**

### Render ROI Calculator (`src/pages/Index.tsx`)
- Add `<ROICalculator />` between `<MoneyImpact />` and `<AsSeenWorking />`. Component already exists and is styled — just needs to be mounted.

### Forgot password (`src/pages/Auth.tsx`)
- Add a "Forgot password?" link below the password field.
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth" })`.
- Shows a toast: "Password reset link sent to your email."

### Onboarding nudge (`src/pages/Dashboard.tsx`)
- When `leads.length === 0` AND settings have no `twilio_phone_number`, show a prominent banner: "You're not set up yet. Add your phone number in Settings to start recovering calls." with a button linking to `/settings`.
- When `leads.length === 0` but settings ARE complete, show a friendlier empty state: "No missed calls yet. We're watching your line — leads will appear here automatically."

---

## Migration Summary

One migration file covering all schema changes:

```sql
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS avg_job_value numeric NOT NULL DEFAULT 350,
  ADD COLUMN IF NOT EXISTS business_hours jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS human_taken_over boolean NOT NULL DEFAULT false;
```

No new tables, no new policies needed (existing RLS already covers these columns on `business_settings` and `leads`).

---

## Edge Function Changes

1. **`twilio-webhook`** (redeploy): inject business hours into prompt; skip AI when `human_taken_over = true`.
2. **`send-manual-sms`** (new): owner-authenticated manual SMS send.

---

## Build Order

1. Migration (schema) — unblocks everything
2. Settings page updates (avg job value + business hours)
3. Dashboard improvements (search, filter, manual status, auto-scroll, toasts, date range)
4. Edge function updates (webhook + new manual SMS function)
5. Landing page (ROI calculator, forgot password, onboarding nudge)
6. Verify: build, typecheck, browser smoke test of dashboard + settings + auth
