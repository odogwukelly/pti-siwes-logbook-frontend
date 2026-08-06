import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, PenLine, Upload } from "lucide-react";

export const Route = createFileRoute("/supervisor/signature")({
  head: () => ({ meta: [{ title: "Digital Signature — PTI e-SIWES" }] }),
  component: SigPage,
});

function SigPage() {
  return (
    <DashboardLayout role="industry" title="Digital signature" subtitle="Manage the cryptographic signature applied to ITF Form 8 documents">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-4">Signature preview</h3>
          <div className="rounded-xl border-2 border-dashed border-border h-48 grid place-items-center font-serif italic text-3xl text-foreground">
            S. Adebayo
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <Button variant="outline"><PenLine className="size-4" />Draw new</Button>
            <Button variant="outline"><Upload className="size-4" />Upload PNG</Button>
            <Button className="bg-pti text-pti-foreground hover:bg-pti/90"><ShieldCheck className="size-4" />Set as default</Button>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div><Label>Display name</Label><Input className="mt-2" defaultValue="Engr. Samuel Adebayo" /></div>
            <div><Label>Title</Label><Input className="mt-2" defaultValue="Senior Field Engineer" /></div>
            <div><Label>Organisation</Label><Input className="mt-2" defaultValue="NNPC Upstream Division" /></div>
            <div><Label>COREN no.</Label><Input className="mt-2" defaultValue="R.18452" /></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-3">Certificate status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Issued</span><span className="font-mono">Jan 14, 2024</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span className="font-mono">Jan 14, 2026</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Algorithm</span><span className="font-mono">RSA-2048</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-success font-semibold">Active</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-pti/5 p-6">
            <ShieldCheck className="size-6 text-pti mb-2" />
            <p className="text-sm font-semibold">Tamper-evident</p>
            <p className="text-xs text-muted-foreground mt-1">Each signature is hash-bound to the log entry and timestamped via the institution's audit trail.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
