import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Lead = {
  id: string;
  phone_number: string;
  customer_name: string | null;
  service_type: string | null;
  urgency: string | null;
  location: string | null;
  status: string;
  source: string | null;
  job_details: Record<string, unknown> | null;
  booked_at: string | null;
  booked_slot: string | null;
  follow_up_count: number | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  lead_id: string;
  direction: string;
  body: string;
  twilio_sid: string | null;
  status: string | null;
  created_at: string;
};

/**
 * Subscribes to a user-scoped realtime channel ('user:<uid>'). Realtime RLS only allows
 * each user to join their own channel. Postgres changes are still RLS-filtered to rows
 * where owner_user_id = auth.uid().
 */
function useUserRealtime(onLeadsChange: () => void, onMessageInsert: (leadId: string) => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const topic = `user:${user.id}`;
    const channel = supabase
      .channel(topic, { config: { private: true } })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads", filter: `owner_user_id=eq.${user.id}` },
        () => onLeadsChange(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `owner_user_id=eq.${user.id}` },
        (payload) => {
          const leadId = (payload.new as { lead_id?: string })?.lead_id;
          if (leadId) onMessageInsert(leadId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onLeadsChange, onMessageInsert]);
}

export function useLeads() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useUserRealtime(
    () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
    (leadId) => queryClient.invalidateQueries({ queryKey: ["messages", leadId] }),
  );

  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useMessages(leadId: string | null) {
  return useQuery({
    queryKey: ["messages", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!leadId,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["business_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
