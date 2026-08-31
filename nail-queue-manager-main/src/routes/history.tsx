import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/salon/PageShell";
import { StatusBadge } from "@/components/salon/StatusBadge";
import { serviceDuration, serviceName, useSalon, useSalonState } from "@/lib/salon/store";
import { ACTIVE_STATUSES } from "@/lib/salon/types";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { title: "Queue History — The Nail Room" },
    { name: "description", content: "Review your completed and cancelled nail salon queue tickets." },
    { property: "og:title", content: "Queue History — The Nail Room" },
    { property: "og:description", content: "Every past ticket with service, status and timings." },
  ]}),
  component: HistoryPage,
});

const fmt = (ts?: number) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

function HistoryPage() {
  const state = useSalonState();
  const removeTicket = useSalon((s) => s.removeTicket);
  const rows = state.tickets
    .filter((t) => state.myTicketIds.includes(t.id) && !ACTIVE_STATUSES.includes(t.status))
    .sort((a, b) => (b.endedAt ?? b.joinedAt) - (a.endedAt ?? a.joinedAt));

  const queueTickets = [...state.tickets]
    .filter((t) => t.status !== "cancelled" && t.status !== "skipped")
    .sort((a, b) => a.joinedAt - b.joinedAt || a.number - b.number);
  const calculatedFinishTimes = new Map<string, number>();
  let previousCalculatedFinish = 0;
  for (const ticket of queueTickets) {
    const durationMs = serviceDuration(state, ticket.serviceId) * 60_000;
    const calculatedStart = ticket.startedAt
      ? Math.max(ticket.startedAt, previousCalculatedFinish)
      : Math.max(ticket.joinedAt, previousCalculatedFinish);
    calculatedFinishTimes.set(ticket.id, calculatedStart + durationMs);
    previousCalculatedFinish = calculatedStart + durationMs;
  }

  const handleDelete = (ticketId: string, ticketNumber: number) => {
    if (window.confirm(`Delete ticket #${ticketNumber} from history?`)) removeTicket(ticketId);
  };

  return <PageShell title="Queue history" subtitle="Your completed and cancelled visits, newest first." action={<Button asChild variant="outline"><Link to="/my-queue">Back to my queue</Link></Button>}>
    {rows.length === 0 ? <Card className="border-dashed"><CardContent className="p-10 text-center"><h2 className="text-lg font-semibold">Nothing here yet</h2><p className="mt-2 text-sm text-muted-foreground">Completed and cancelled tickets will appear here.</p><Button asChild className="mt-6"><Link to="/join">Join the queue</Link></Button></CardContent></Card> :
      <Card className="border-border/70 shadow-soft"><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Service</TableHead><TableHead>Joined</TableHead><TableHead>Finished</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
        {rows.map((t) => <TableRow key={t.id}><TableCell className="font-medium">#{t.number}</TableCell><TableCell>{serviceName(state, t.serviceId)}</TableCell><TableCell>{fmt(t.joinedAt)}</TableCell><TableCell>{fmt(t.status === "cancelled" ? t.endedAt : calculatedFinishTimes.get(t.id))}</TableCell><TableCell><StatusBadge status={t.status} /></TableCell><TableCell className="text-right"><Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id, t.number)}><Trash2 className="mr-1 size-4" />Delete</Button></TableCell></TableRow>)}
      </TableBody></Table></CardContent></Card>}
  </PageShell>;
}
