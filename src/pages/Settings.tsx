import { useState, useEffect } from "react";
import { useSettings, type BusinessHours } from "@/hooks/use-leads";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Plus, X } from "lucide-react";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

type DayHours = { enabled: boolean; open: string; close: string };

const emptyHours: Record<string, DayHours> = Object.fromEntries(
  DAYS.map((d) => [d.key, { enabled: false, open: "08:00", close: "17:00" }]),
);

function settingsToDayHours(raw: BusinessHours): Record<string, DayHours> {
  const result: Record<string, DayHours> = { ...emptyHours };
  for (const d of DAYS) {
    const entry = raw?.[d.key];
    if (entry && entry.open && entry.close) {
      result[d.key] = { enabled: true, open: entry.open, close: entry.close };
    }
  }
  return result;
}

function dayHoursToSettings(h: Record<string, DayHours>): BusinessHours {
  const out: BusinessHours = {};
  for (const d of DAYS) {
    const v = h[d.key];
    if (v?.enabled) out[d.key] = { open: v.open, close: v.close };
  }
  return out;
}

const Settings = () => {
  const { data: settings, isLoading, isError, error } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [demoAgentLabel, setDemoAgentLabel] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");
  const [avgJobValue, setAvgJobValue] = useState(350);
  const [hours, setHours] = useState<Record<string, DayHours>>({ ...emptyHours });
  const [saving, setSaving] = useState(false);

  // Guard: never render another owner's business settings. If RLS denies
  // access (or the fetched row doesn't belong to the signed-in user), show a
  // friendly message instead of the form.
  const accessDenied =
    isError || (!!settings && !!user && settings.owner_user_id !== user.id);

  const normalizePhone = (raw: string): string | null => {
    const cleaned = raw.replace(/[\s\-().]/g, "");
    if (!cleaned) return "";
    const withPlus = cleaned.startsWith("+")
      ? cleaned
      : cleaned.length === 11 && cleaned.startsWith("1")
        ? `+${cleaned}`
        : cleaned.length === 10
          ? `+1${cleaned}`
          : null;
    if (!withPlus) return null;
    return /^\+1\d{10}$/.test(withPlus) ? withPlus : null;
  };

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name || "");
      setServiceArea(settings.service_area || "");
      setServices(settings.services || []);
      setTwilioPhone(settings.twilio_phone_number || "");
      setAvgJobValue(settings.avg_job_value ?? 350);
      setHours(settingsToDayHours((settings.business_hours || {}) as BusinessHours));
    }
    if (typeof window !== "undefined") {
      setDemoAgentLabel(window.localStorage.getItem("demoAgentLabel") || "");
    }
  }, [settings]);

  const addService = () => {
    const trimmed = newService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices([...services, trimmed]);
      setNewService("");
    }
  };

  const removeService = (s: string) => setServices(services.filter((x) => x !== s));

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be signed in to save settings");
      return;
    }
    let normalizedPhone: string | null = "";
    if (twilioPhone.trim()) {
      normalizedPhone = normalizePhone(twilioPhone);
      if (normalizedPhone === null) {
        toast.error("Enter a valid phone in E.164 format, like +17372711871");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        business_name: businessName || "My Business",
        service_area: serviceArea,
        services,
        twilio_phone_number: normalizedPhone || null,
        avg_job_value: avgJobValue || 350,
        business_hours: dayHoursToSettings(hours),
      };
      console.log("[Settings] save auth.uid:", user.id);
      console.log("[Settings] save payload:", payload);
      const { data: saved, error } = await supabase
        .from("business_settings")
        .upsert(
          { ...payload, owner_user_id: user.id } as any,
          { onConflict: "owner_user_id" },
        )
        .select()
        .maybeSingle();
      if (typeof window !== "undefined") {
        const trimmed = demoAgentLabel.trim();
        if (trimmed) {
          window.localStorage.setItem("demoAgentLabel", trimmed);
        } else {
          window.localStorage.removeItem("demoAgentLabel");
        }
      }
      if (error) {
        console.error("[Settings] save error", error);
        toast.error(error.message || "Failed to save settings");
        return;
      }
      console.log("[Settings] saved row:", saved);
      if (saved) {
        // Guard: only repopulate from a row we actually own. RLS should already
        // block cross-owner upserts, but never trust the returned row blindly.
        if (saved.owner_user_id && user && saved.owner_user_id === user.id) {
          setBusinessName(saved.business_name || "");
          setServiceArea(saved.service_area || "");
          setServices(saved.services || []);
          setTwilioPhone(saved.twilio_phone_number || "");
          setAvgJobValue(saved.avg_job_value ?? 350);
          setHours(settingsToDayHours((saved.business_hours || {}) as BusinessHours));
        } else {
          console.error("[Settings] saved row owner mismatch", saved.owner_user_id, user?.id);
          toast.error("Could not verify ownership of the saved settings.");
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["business_settings"] });
      toast.success("Settings saved.");
    } catch (e: any) {
      console.error("[Settings] save exception", e);
      toast.error(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container py-12 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-xl py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Settings unavailable
          </h1>
          <p className="text-sm text-muted-foreground">
            We couldn't load your business settings. This usually means your
            session expired or your account doesn't have access to these
            settings. Please sign back in and try again.
          </p>
          <Button variant="outline" onClick={() => (window.location.href = "/auth")}>
            Sign in again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container max-w-xl py-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Business Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your business identity so the AI can personalize every message.
          </p>
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="bizName">Business Name</Label>
            <Input
              id="bizName"
              placeholder="e.g. Austin Plumbing"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The AI will introduce itself as part of your team: "This is Mike from Austin Plumbing."
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceArea">Service Area</Label>
            <Input
              id="serviceArea"
              placeholder="e.g. Greater Austin, TX"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twilioPhone">CallRecover phone number</Label>
            <Input
              id="twilioPhone"
              placeholder="+17372711871"
              value={twilioPhone}
              onChange={(e) => setTwilioPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the Twilio number assigned to this business. Use E.164 format, like +17372711871.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avgJobValue">Average Job Value ($)</Label>
            <Input
              id="avgJobValue"
              type="number"
              min={1}
              step={25}
              value={avgJobValue}
              onChange={(e) => setAvgJobValue(Number(e.target.value) || 350)}
            />
            <p className="text-xs text-muted-foreground">
              Used to calculate recovered revenue on your dashboard. Most home-service jobs range from $200–$600.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Business Hours</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              The AI uses these when scheduling. Uncheck a day to mark it closed.
            </p>
            <div className="space-y-2">
              {DAYS.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`hrs-${d.key}`}
                    checked={hours[d.key].enabled}
                    onChange={(e) =>
                      setHours((h) => ({
                        ...h,
                        [d.key]: { ...h[d.key], enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <Label htmlFor={`hrs-${d.key}`} className="w-24 text-sm font-normal cursor-pointer">
                    {d.label}
                  </Label>
                  <Input
                    type="time"
                    value={hours[d.key].open}
                    disabled={!hours[d.key].enabled}
                    onChange={(e) =>
                      setHours((h) => ({
                        ...h,
                        [d.key]: { ...h[d.key], open: e.target.value },
                      }))
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    value={hours[d.key].close}
                    disabled={!hours[d.key].enabled}
                    onChange={(e) =>
                      setHours((h) => ({
                        ...h,
                        [d.key]: { ...h[d.key], close: e.target.value },
                      }))
                    }
                    className="w-32"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoAgentLabel">Chat Demo Header Label (optional)</Label>
            <Input
              id="demoAgentLabel"
              placeholder="Your AI Agent"
              value={demoAgentLabel}
              onChange={(e) => setDemoAgentLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown at the top of the landing page chat demo. Leave blank to use the default "Your AI Agent".
            </p>
          </div>

          <div className="space-y-2">
            <Label>Services Offered</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Water heater repair"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              />
              <Button variant="outline" size="icon" onClick={addService} type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {services.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {services.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium"
                  >
                    {s}
                    <button onClick={() => removeService(s)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
