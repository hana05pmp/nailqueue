import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/salon/PageShell";
import { StatusBadge } from "@/components/salon/StatusBadge";
import { removeTicket, serviceDuration, serviceName, useSalonState } from "@/lib/salon/store";
import { ACTIVE_STATUSES } from "@/lib/salon/types";
import { Trash2 } from "lucide-react";

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

  // Use the actual service start time when it exists.
  // If the customer started immediately, waiting time is 0, so finish is simply
  // joined/start time + service duration. If they waited, startedAt already
  // contains that waiting period, so it is included exactly once.
  const calculatedFinishTimes = new Map<string, number>();
  for (const ticket of state.tickets) {
    if (ticket.status === "cancelled" || ticket.status === "skipped") continue;
    const startTime = ticket.startedAt ?? ticket.joinedAt;
    calculatedFinishTimes.set(
      ticket.id,
      startTime + serviceDuration(state, ticket.serviceId) * 60_000,
    );
  }

  const handleDelete = (ticketId: string, ticketNumber: number) => {
    if (window.confirm(`Delete ticket #${ticketNumber} from history?`)) {
      removeTicket(ticketId);
    }
  };

  return (
    <PageShell title="Queue history" subtitle="Completed and cancelled visits, newest first." action={<Button asChild variant="outline"><Link to="/staff/dashboard">Back to queue</Link></Button>}>
      {rows.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-10 text-center"><h2 className="text-lg font-semibold">Nothing here yet</h2><p className="mt-2 text-sm text-muted-foreground">Completed and cancelled tickets will appear here.</p></CardContent></Card>
      ) : (
        <Card className="border-border/70 shadow-soft">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>Joined</TableHead><TableHead>Finished</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
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
                      <TableCell className="text-right">
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(t.id, t.number)}>
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      </TableCell>
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
