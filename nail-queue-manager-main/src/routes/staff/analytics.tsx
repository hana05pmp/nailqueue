import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/salon/PageShell";
import { StaffGuard } from "@/components/salon/StaffGuard";
import { serviceName, useSalonState } from "@/lib/salon/store";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/staff/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const state = useSalonState();
  const completed = state.tickets.filter((t) => t.status === "completed");
  const active = state.tickets.filter((t) => ["waiting", "called", "serving"].includes(t.status));
  const skipped = state.tickets.filter((t) => t.status === "skipped");
  const cancelled = state.tickets.filter((t) => t.status === "cancelled");
  const serviceCounts = state.services.map((service) => ({ name: service.name, tickets: state.tickets.filter((t) => t.serviceId === service.id).length }));

  return <StaffGuard><PageShell title="Analytics" subtitle="A quick view of queue performance and service demand.">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[['Completed', completed.length], ['Active', active.length], ['Skipped', skipped.length], ['Cancelled', cancelled.length]].map(([label, value]) => <Card key={String(label)}><CardContent className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-4xl font-semibold">{value}</p></CardContent></Card>)}
    </div>
    <Card className="mt-6"><CardContent className="p-6"><h2 className="mb-4 text-lg font-semibold">Tickets by service</h2><div className="h-[360px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={serviceCounts} margin={{ top: 10, right: 10, left: 0, bottom: 55 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="tickets" name="Tickets" /></BarChart></ResponsiveContainer></div></CardContent></Card>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Completed by service</h2><div className="mt-4 space-y-3">{state.services.map((s) => <div key={s.id} className="flex justify-between border-b pb-2 text-sm"><span>{s.name}</span><span className="font-semibold">{completed.filter((t) => t.serviceId === s.id).length}</span></div>)}</div></CardContent></Card><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Queue snapshot</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span>Waiting</span><span>{state.tickets.filter((t) => t.status === "waiting").length}</span></div><div className="flex justify-between"><span>Called</span><span>{state.tickets.filter((t) => t.status === "called").length}</span></div><div className="flex justify-between"><span>Serving</span><span>{state.tickets.filter((t) => t.status === "serving").length}</span></div></div></CardContent></Card></div>
  </PageShell></StaffGuard>;
}
