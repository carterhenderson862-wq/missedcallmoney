import { useState } from "react";
import { useLeads, useMessages, type Lead } from "@/hooks/use-leads";
import LeadsList from "@/components/dashboard/LeadsList";
import ConversationView from "@/components/dashboard/ConversationView";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";

const Dashboard = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { data: leads, isLoading } = useLeads();
  const { data: messages } = useMessages(selectedLead?.id || null);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container py-6">
        <StatsBar leads={leads || []} />
        <div className="grid md:grid-cols-[380px_1fr] gap-6 mt-6">
          <LeadsList
            leads={leads || []}
            isLoading={isLoading}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
          />
          <ConversationView
            lead={selectedLead}
            messages={messages || []}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
