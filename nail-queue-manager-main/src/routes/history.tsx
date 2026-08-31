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
      {
        name: "description",
        content: "Review your completed and cancelled nail salon queue tickets.",
      },
      { property: "og:title", content: "Queue History — The Nail Room" },
      {
        property: "og:description",
        content: "Every past ticket with service, status and timings.",
      },
    ],
  }),
  component: HistoryPage,
});

const fmt = (ts?: number) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

const calculatedFinishedAt = (
  joinedAt: number,
  startedAt: number | undefined,
  durationMin: number,
  endedAt: number | undefined,
  status: string,
) => {
  if (status === "cancelled") return endedAt;
  if (startedAt) return startedAt + durationMin * 60_000;
  return endedAt ?? joinedAt + durationMin * 60_000;
};

function HistoryPage() {
  const state = useSalonState();
  const rows = state.tickets
    .filter((t) => state.myTicketIds.includes(t.id) && !ACTIVE_STATUSES.includes(t.status))
    .sort((a, b) => (b.endedAt ?? b.joinedAt) - (a.endedAt ?? a.joinedAt));

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
            <p className="mt-2 text-sm text-muted-foreground">
              Completed and cancelled tickets will appear here.
            </p>
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
                  const durationMin = serviceDuration(state, t.serviceId);
                  const finishedAt = calculatedFinishedAt(
                    t.joinedAt,
                    t.startedAt,
                    durationMin,
                    t.endedAt,
                    t.status,
                  );

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
