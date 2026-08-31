import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/salon/PageShell";
import { StatusBadge } from "@/components/salon/StatusBadge";
import { serviceDuration, serviceName, useSalonState } from "@/lib/salon/store";
import { ACTIVE_STATUSES } from "@/lib/salon/types";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { title: "Queue History — The Nail Room" },
    { name: "description", content: "Review completed and cancelled nail salon queue tickets." },
  ]}),
  component: HistoryPage,
});

const fmt = (ts?: number) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

function HistoryPage() {
  const state = useSalonState();
  const rows = state.tickets
    .filter((t) => !ACTIVE_STATUSES.includes(t.status))
    .sort((a, b) => (b.endedAt ?? b.joinedAt) - (a.endedAt ?? a.joinedAt));

  const calculatedFinishTimes = new Map<string, number>();
  const orderedTickets = [...state.tickets]
    .filter((t) => t.status !== "cancelled" && t.status !== "skipped")
    .sort((a, b) => a.joinedAt - b.joinedAt || a.number - b.number);

  for (const ticket of orderedTickets) {
    const estimatedWaitMin = orderedTickets
      .filter((other) => other.id !== ticket.id && other.joinedAt < ticket.joinedAt)
      .reduce((total, other) => total + serviceDuration(state, other.serviceId), 0);
    const serviceMin = serviceDuration(state, ticket.serviceId);
    calculatedFinishTimes.set(ticket.id, ticket.joinedAt + (estimatedWaitMin + serviceMin) * 60_000);
  }

  return (
    <PageShell title="Queue history" subtitle="Completed and cancelled visits, newest first." action={<Button asChild variant="outline"><Link to="/staff/dashboard">Back to queue</Link></Button>}>
      {rows.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-10 text-center"><h2 className="text-lg font-semibold">Nothing here yet</h2><p className="mt-2 text-sm text-muted-foreground">Completed and cancelled tickets will appear here.</p></CardContent></Card>
      ) : (
        <Card className="border-border/70 shadow-soft">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>Joined</TableHead><TableHead>Finished</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((t) => {
                  const finishedAt = t.status === "cancelled" ? t.endedAt : calculatedFinishTimes.get(t.id);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">#{t.number}</TableCell>
                      <TableCell>{t.customerName}</TableCell>
                      <TableCell>{serviceName(state, t.serviceId)}</TableCell>
                      <TableCell>{fmt(t.joinedAt)}</TableCell>
                      <TableCell>{fmt(finishedAt)}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
