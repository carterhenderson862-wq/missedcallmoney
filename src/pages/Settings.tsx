import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-leads";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Plus, X } from "lucide-react";

const Settings = () => {
  const { data: settings, isLoading } = useSettings();
  const [businessName, setBusinessName] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [demoAgentLabel, setDemoAgentLabel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name || "");
      setServiceArea((settings as any).service_area || "");
      setServices(settings.services || []);
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
    if (!settings?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("business_settings")
      .update({
        business_name: businessName,
        service_area: serviceArea,
        services,
      } as any)
      .eq("id", settings.id);
    if (typeof window !== "undefined") {
      const trimmed = demoAgentLabel.trim();
      if (trimmed) {
        window.localStorage.setItem("demoAgentLabel", trimmed);
      } else {
        window.localStorage.removeItem("demoAgentLabel");
      }
    }
    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
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
