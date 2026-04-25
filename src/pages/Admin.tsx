import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  business_name: string | null;
  twilio_phone_number: string | null;
  service_area: string | null;
  services: string[] | null;
}

interface Lead {
  id: string;
  status: string;
  owner_user_id: string;
  created_at: string;
}

interface Activity {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
}

const AVG_JOB_VALUE = 350;

const Admin = () => {
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeConvos, setActiveConvos] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    (async () => {
      setDataLoading(true);
      const [usersRes, leadsRes, activityRes, msgRes] = await Promise.all([
        supabase.rpc("admin_list_users"),
        supabase.from("leads").select("id,status,owner_user_id,created_at"),
        supabase
          .from("admin_activity")
          .select("id,event_type,description,created_at")
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("messages")
          .select("lead_id")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);
      if (!active) return;
      if (usersRes.data) setUsers(usersRes.data as AdminUser[]);
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (activityRes.data) setActivity(activityRes.data as Activity[]);
      if (msgRes.data) {
        const unique = new Set(msgRes.data.map((m: any) => m.lead_id));
        setActiveConvos(unique.size);
      }
      setDataLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace state={{ from: "/admin" }} />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-display font-bold">Access denied</h1>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
        <Link to="/dashboard" className="text-primary underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  const totalLeads = leads.length;
  const totalBooked = leads.filter((l) => l.status === "booked").length;
  const recovered = totalBooked * AVG_JOB_VALUE;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">Admin Panel</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Overview stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total users" value={users.length} />
          <StatCard label="Total leads" value={totalLeads} />
          <StatCard label="Booked" value={totalBooked} />
          <StatCard label="Active convos (24h)" value={activeConvos} />
        </section>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Estimated recovered revenue</div>
          <div className="font-mono text-3xl font-bold text-primary mt-1">
            ${recovered.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Based on {totalBooked} booked × ${AVG_JOB_VALUE} avg job
          </div>
        </Card>

        {/* Users / Signups */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Users / Signups</h2>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Signed up</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground text-center">Loading…</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground text-center">No users yet</TableCell></TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>{u.business_name ?? "—"}</TableCell>
                      <TableCell>{new Date(u.created_at).toLocaleString()}</TableCell>
                      <TableCell>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}</TableCell>
                      <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Businesses */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Businesses</h2>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Twilio #</TableHead>
                  <TableHead>Setup</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter((u) => u.business_name).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground text-center">No businesses yet</TableCell></TableRow>
                ) : (
                  users.filter((u) => u.business_name).map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">{u.business_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.services?.join(", ") || "—"}</TableCell>
                      <TableCell className="font-mono">{u.twilio_phone_number ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.twilio_phone_number ? "default" : "outline"}>
                          {u.twilio_phone_number ? "Complete" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Recent activity</h2>
          <Card className="p-4">
            {activity.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-4">No recent activity</div>
            ) : (
              <ul className="space-y-2">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-4 text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{a.event_type}</Badge>
                      <span>{a.description}</span>
                    </div>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card className="p-4">
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className="font-mono text-2xl font-bold mt-1">{value}</div>
  </Card>
);

export default Admin;
