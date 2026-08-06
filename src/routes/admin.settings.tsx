import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — PTI e-SIWES" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <DashboardLayout role="admin" title="System settings" subtitle="Institution-wide configuration">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-1">Institution profile</h3>
            <p className="text-xs text-muted-foreground mb-5">Branding shown across all logbooks and ITF reports</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Institution name</Label><Input className="mt-2" defaultValue="Petroleum Training Institute" /></div>
              <div><Label>Short code</Label><Input className="mt-2" defaultValue="PTI" /></div>
              <div><Label>Address</Label><Input className="mt-2" defaultValue="Effurun, Delta State" /></div>
              <div><Label>ITF Liaison email</Label><Input className="mt-2" defaultValue="liaison@pti.edu.ng" /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-1">SIWES cycle</h3>
            <p className="text-xs text-muted-foreground mb-5">Active placement window</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Cycle name</Label><Input className="mt-2" defaultValue="2024 — Full" /></div>
              <div><Label>Start</Label><Input type="date" className="mt-2" defaultValue="2024-07-01" /></div>
              <div><Label>End</Label><Input type="date" className="mt-2" defaultValue="2024-12-31" /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-5">Notifications</h3>
            <div className="space-y-4">
              {[{l:"Email digests to students",d:"Sent every Monday morning",v:true},{l:"SMS alerts for overdue logs",d:"After 48 hours of inactivity",v:true},{l:"Weekly compliance report to admins",d:"Sent every Sunday 6pm",v:false}].map(s => (
                <div key={s.l} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                  <div><p className="font-semibold text-sm">{s.l}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <Switch defaultChecked={s.v} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end"><Button className="bg-pti text-pti-foreground hover:bg-pti/90">Save changes</Button></div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-3">System status</h3>
            <div className="space-y-3 text-sm">
              {[{l:"API",v:"Operational",c:"success"},{l:"Database",v:"Operational",c:"success"},{l:"File storage",v:"Operational",c:"success"},{l:"Email service",v:"Degraded",c:"warning"}].map(r => (
                <div key={r.l} className="flex items-center justify-between"><span className="text-muted-foreground">{r.l}</span><span className={`font-semibold text-${r.c}`}>{r.v}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-3">Version</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Build</span><span className="font-mono">v3.4.1</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last deploy</span><span className="font-mono">Oct 22</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-mono">eu-west-1</span></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
