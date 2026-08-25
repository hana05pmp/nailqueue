import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/salon/PageShell";
import { StatusBadge } from "@/components/salon/StatusBadge";
import {
  cancelTicket,
  estimatedWaitMin,
  nowServing,
  positionOf,
  serviceName,
  useSalonState,
  waitingTickets,
} from "@/lib/salon/store";
import { ACTIVE_STATUSES } from "@/lib/salon/types";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/my-queue")({
  head: () => ({
    meta: [
      { title: "My Queue Ticket — Lacquer Lane" },
      {
        name: "description",
        content:
          "Track your nail salon ticket: queue position, customers ahead and estimated waiting time.",
      },
      { property: "og:title", content: "My Queue Ticket — Lacquer Lane" },
      {
        property: "og:description",
        content: "Live position, customers ahead and estimated wait for your ticket.",
      },
    ],
  }),
  component: MyQueuePage,
});

function MyQueuePage() {
  const state = useSalonState();
  const serving = nowServing(state);
  const mine = state.tickets
    .filter((t) => state.myTicketIds.includes(t.id) && ACTIVE_STATUSES.includes(t.status))
    .sort((a, b) => a.joinedAt - b.joinedAt);

  return (
    <PageShell
      title="My queue"
      subtitle="Your active tickets update automatically as the salon calls customers."
      action={
        <Button asChild variant="outline">
          <Link to="/history">Queue history</Link>
        </Button>
      }
    >
      <Card className="mb-6 border-border/70 bg-blush">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs font-medium tracking-wide uppercase">Now serving</p>
            <p className="font-display text-4xl font-semibold">
              {serving ? `#${serving.number}` : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium tracking-wide uppercase">In line</p>
            <p className="font-display text-4xl font-semibold">{waitingTickets(state).length}</p>
          </div>
        </CardContent>
      </Card>

      {mine.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <h2 className="text-lg font-semibold">No active ticket</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the queue to get your number and live wait estimate.
            </p>
            <Button asChild className="mt-6">
              <Link to="/join">Join the queue</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((ticket) => {
            const position = positionOf(state, ticket);
            const ahead = Math.max(0, position - 1);
            return (
              <Card key={ticket.id} className="border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        Ticket
                      </p>
                      <p className="font-display text-5xl font-semibold">#{ticket.number}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ticket.customerName} · {serviceName(state, ticket.serviceId)}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/70 pt-5 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="font-display text-2xl font-semibold">
                        {ticket.status === "waiting" ? position : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Users className="size-3" /> Ahead
                      </p>
                      <p className="font-display text-2xl font-semibold">
                        {ticket.status === "waiting" ? ahead : 0}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> Wait
                      </p>
                      <p className="font-display text-2xl font-semibold">
                        {ticket.status === "waiting" ? formatDuration(estimatedWaitMin(state, ticket)) : "Now"}
                      </p>
                    </div>
                  </div>

                  {ticket.status !== "serving" && (
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                      onClick={() => {
                        cancelTicket(ticket.id);
                        toast.success(`Ticket #${ticket.number} cancelled`);
                      }}
                    >
                      Cancel my ticket
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
