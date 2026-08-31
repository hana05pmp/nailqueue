import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageShell } from "@/components/salon/PageShell";
import { StatusBadge } from "@/components/salon/StatusBadge";
import { serviceDuration, serviceName, useSalonState } from "@/lib/salon/store";
import { ACTIVE_STATUSES } from "@/lib/salon/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Queue History — The Nail Room" },
      { name: "description", content: "Review your completed and cancelled nail salon queue tickets." },
      { property: "og:title", content: "Queue History — The Nail Room" },
      { property: "og:description", content: "Every past ticket with service, status and timings." },
    ],
  }),
  component: HistoryPage,
});

const fmt = (ts?: number) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

function HistoryPage() {
  const state = useSalonState();

  const rows = state.tickets
    .filter((t) => state.myTicketIds.includes(t.id) && !ACTIVE_STATUSES.includes(t.status))
    .sort((a, b) => (b.endedAt ?? b.joinedAt) - (a.endedAt ?? a.joinedAt));

  // Calculate the scheduled finish for every ticket in queue order.
  // A ticket cannot start until the previous ticket's service is finished.
  // Therefore: finish = max(joined time, previous finish) + service duration.
  // This makes ticket #132 wait for #131 instead of only adding its own service time.
  const calculatedFinishTimes = new Map<string, number>();
  const queueTickets = [...state.tickets]
    .filter((t) => t.status !== "cancelled" && t.status !== "skipped")
    .sort((a, b) => a.joinedAt - b.joinedAt || a.number - b.number);

  let previousFinish = 0;
  for (const ticket of queueTickets) {
    const serviceStart = Math.max(ticket.joinedAt, previousFinish);
    const finish = serviceStart + serviceDuration(state, ticket.serviceId) * 60_000;
    calculatedFinishTimes.set(ticket.id, finish);
    previousFinish = finish;
  }

  return (
    <PageShell
      title="Queue history"
      subtitle="Your completed and cancelled visits, newest first."
      action={
        <Button asChild variant="outline">
          <Link to="/my-queue">Back to my queue</Link>
        </Button>
      }
    >
      {rows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <h2 className="text-lg font-semibold">Nothing here yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Completed and cancelled tickets will appear here.</p>
            <Button asChild className="mt-6">
              <Link to="/join">Join the queue</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 shadow-soft">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Finished</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => {
                  const finishedAt = t.status === "cancelled"
                    ? t.endedAt
                    : calculatedFinishTimes.get(t.id);

                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">#{t.number}</TableCell>
                      <TableCell>{serviceName(state, t.serviceId)}</TableCell>
                      <TableCell>{fmt(t.joinedAt)}</TableCell>
                      <TableCell>{fmt(finishedAt)}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={t.status} />
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
