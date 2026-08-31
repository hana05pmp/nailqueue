import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/salon/PageShell";
import { StaffGuard } from "@/components/salon/StaffGuard";
import { useSalonState } from "@/lib/salon/store";
import { calculateMM1, calculateMMs, formatMetric, minutes } from "@/lib/salon/queueing";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/staff/analytics")({ component: AnalyticsPage });

const formatWaitTime = (totalMinutes: number) => {
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
};

function AnalyticsPage() {
  const state = useSalonState();
  const [servers, setServers] = useState(1);
  const [model, setModel] = useState<"mm1" | "mms">("mm1");
  const [hours, setHours] = useState(3);

  const completed = state.tickets.filter((t) => t.status === "completed");
  const active = state.tickets.filter((t) => ["waiting", "called", "serving"].includes(t.status));
  const skipped = state.tickets.filter((t) => t.status === "skipped");
  const cancelled = state.tickets.filter((t) => t.status === "cancelled");

  const analysis = useMemo(() => {
    const periodHours = Math.max(0.25, Number(hours) || 3);
    const observedTickets = state.tickets.filter((t) => t.joinedAt > 0);
    const arrivalRate = observedTickets.length / periodHours;
    const completedServiceTimes = completed
      .map((t) => state.services.find((s) => s.id === t.serviceId)?.durationMin)
      .filter((value): value is number => Number.isFinite(value) && value > 0);
    const avgServiceMin = completedServiceTimes.length
      ? completedServiceTimes.reduce((sum, value) => sum + value, 0) / completedServiceTimes.length
      : state.services.length
        ? state.services.reduce((sum, s) => sum + s.durationMin, 0) / state.services.length
        : 30;
    const serviceRate = 60 / Math.max(0.1, avgServiceMin);
    const metrics = model === "mm1" ? calculateMM1(arrivalRate, serviceRate) : calculateMMs(arrivalRate, serviceRate, servers);
    const actualWaiting = completed
      .filter((t) => t.startedAt && t.joinedAt && t.startedAt >= t.joinedAt)
      .map((t) => (t.startedAt! - t.joinedAt) / 60000);
    const actualService = completedServiceTimes;
    const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return {
      arrivalRate,
      serviceRate,
      avgServiceMin,
      metrics,
      actualWaiting: avg(actualWaiting),
      actualService: avg(actualService),
      completionRate: state.tickets.length ? (completed.length / state.tickets.length) * 100 : 0,
    };
  }, [state.tickets, state.services, model, servers, hours, completed]);

  const { metrics } = analysis;
  const whatIf = [1, 2, 3].map((s) => {
    const m = calculateMMs(analysis.arrivalRate, analysis.serviceRate, s);
    return {
      servers: `${s} ${s === 1 ? "technician" : "technicians"}`,
      utilization: Number.isFinite(m.utilization) ? Number((m.utilization * 100).toFixed(1)) : 100,
      waiting: Number.isFinite(m.wqHours) ? minutes(m.wqHours) : 999,
    };
  });

  return <StaffGuard><PageShell title="Analytics" subtitle="Queue performance, service demand, and Queuing Theory analysis.">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[['Completed', completed.length], ['Active', active.length], ['Skipped', skipped.length], ['Cancelled', cancelled.length]].map(([label, value]) => <Card key={String(label)}><CardContent className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-4xl font-semibold">{value}</p></CardContent></Card>)}
    </div>

    <Card className="mt-6"><CardContent className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h2 className="text-xl font-semibold">Queuing Theory Performance Analysis</h2><p className="mt-1 text-sm text-muted-foreground">Calculated from recorded queue activity and configured service durations.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="text-sm">Model<select className="mt-1 block w-full rounded-md border bg-background px-3 py-2" value={model} onChange={(e) => setModel(e.target.value as "mm1" | "mms")}><option value="mm1">M/M/1</option><option value="mms">M/M/s</option></select></label>
          <label className="text-sm">Analysis hours<input type="number" min="0.25" step="0.25" className="mt-1 block w-full rounded-md border bg-background px-3 py-2" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
          <label className="text-sm">Technicians<input type="number" min="1" max="20" className="mt-1 block w-full rounded-md border bg-background px-3 py-2" value={servers} disabled={model === "mm1"} onChange={(e) => setServers(Math.max(1, Number(e.target.value)))} /></label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Arrival Rate (λ)" value={`${formatMetric(analysis.arrivalRate)} cust/hr`} />
        <Metric title="Service Rate (μ)" value={`${formatMetric(analysis.serviceRate)} cust/hr`} />
        <Metric title="Utilization (ρ)" value={`${formatMetric(metrics.utilization * 100, 1)}%`} />
        <Metric title="Capacity" value={`${formatMetric(metrics.capacity)} cust/hr`} />
        <Metric title="Lq — Avg. Queue" value={`${formatMetric(metrics.lq)} cust`} />
        <Metric title="L — Avg. System" value={`${formatMetric(metrics.l)} cust`} />
        <Metric title="Wq — Avg. Waiting" value={formatWaitTime(minutes(metrics.wqHours))} />
        <Metric title="W — Avg. System Time" value={formatWaitTime(minutes(metrics.wHours))} />
      </div>

      <div className={`mt-6 rounded-lg border p-4 ${metrics.stable ? "" : "border-destructive"}`}>
        <p className="font-semibold">{metrics.stable ? "✓ Stable Queue" : "⚠ Unstable Queue"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{metrics.stable ? `Arrival rate is below system capacity (${formatMetric(metrics.capacity)} customers/hour).` : "Arrival rate is at or above system capacity. Add service capacity or reduce the arrival load."}</p>
      </div>
    </CardContent></Card>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Actual vs Theoretical Performance</h2><div className="mt-4 space-y-4 text-sm"><Row label="Actual average waiting time" value={formatWaitTime(analysis.actualWaiting)} /><Row label="Theoretical Wq" value={formatWaitTime(minutes(metrics.wqHours))} /><Row label="Actual average service time" value={formatWaitTime(analysis.actualService || analysis.avgServiceMin)} /><Row label="Completion rate" value={`${formatMetric(analysis.completionRate, 1)}%`} /></div></CardContent></Card>
      <Card><CardContent className="p-6"><h2 className="text-lg font-semibold">What-If: Add Technicians</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="pb-2">Servers</th><th className="pb-2">Utilization</th><th className="pb-2">Wq</th></tr></thead><tbody>{whatIf.map((r) => <tr key={r.servers} className="border-b"><td className="py-2">{r.servers}</td><td className="py-2">{r.utilization}%</td><td className="py-2">{r.waiting >= 999 ? "∞" : formatWaitTime(r.waiting)}</td></tr>)}</tbody></table></div></CardContent></Card>
    </div>

    <Card className="mt-6"><CardContent className="p-6"><h2 className="mb-4 text-lg font-semibold">Tickets by Service</h2><div className="h-[360px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={state.services.map((service) => ({ name: service.name, tickets: state.tickets.filter((t) => t.serviceId === service.id).length }))} margin={{ top: 10, right: 10, left: 0, bottom: 55 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="tickets" name="Tickets" /></BarChart></ResponsiveContainer></div></CardContent></Card>

    <div className="mt-6 grid gap-6 lg:grid-cols-2"><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Completed by service</h2><div className="mt-4 space-y-3">{state.services.map((s) => <div key={s.id} className="flex justify-between border-b pb-2 text-sm"><span>{s.name}</span><span className="font-semibold">{completed.filter((t) => t.serviceId === s.id).length}</span></div>)}</div></CardContent></Card><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Queue Snapshot</h2><div className="mt-4 space-y-3 text-sm"><Row label="Waiting" value={String(state.tickets.filter((t) => t.status === "waiting").length)} /><Row label="Called" value={String(state.tickets.filter((t) => t.status === "called").length)} /><Row label="Serving" value={String(state.tickets.filter((t) => t.status === "serving").length)} /></div></CardContent></Card></div>
  </PageShell></StaffGuard>;
}

function Metric({ title, value }: { title: string; value: string }) { return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b pb-2"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>; }
