import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useLeads() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
  });
}

export function useMessages(leadId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;
    const channel = supabase
      .channel(`messages-${leadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `lead_id=eq.${leadId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", leadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient]);

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
      // RLS scopes this to the current user's row (one per user, enforced by unique index)
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
