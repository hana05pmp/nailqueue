import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/salon/PageShell";
import { joinQueue, nowServing, useSalonState, waitingTickets } from "@/lib/salon/store";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/join")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Join the Queue — Lacquer Lane" },
      {
        name: "description",
        content:
          "Pick a nail service, enter your name and get a queue ticket with a live wait estimate.",
      },
      { property: "og:title", content: "Join the Queue — Lacquer Lane" },
      {
        property: "og:description",
        content: "Get a digital nail salon ticket in seconds.",
      },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { service } = Route.useSearch();
  const state = useSalonState();
  const services = state.services.filter((s) => s.active);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string | undefined>(service);

  const waiting = waitingTickets(state);
  const chosen = services.find((s) => s.id === selected);
  const serving = nowServing(state);
  const servingRemaining = serving
    ? Math.max(
        0,
        (state.services.find((s) => s.id === serving.serviceId)?.durationMin ?? 30) -
          (Date.now() - (serving.startedAt ?? Date.now())) / 60000,
      )
    : 0;
  const estimate = Math.round(
    waiting.reduce(
      (sum, t) => sum + (state.services.find((s) => s.id === t.serviceId)?.durationMin ?? 30),
      0,
    ) + servingRemaining,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter your name");
    if (!selected) return toast.error("Please choose a service");
    const ticket = joinQueue(name, selected);
    toast.success(`You're in! Your ticket is #${ticket.number}`);
    navigate({ to: "/my-queue" });
  }

  return (
    <PageShell
      title="Join the queue"
      subtitle="Two quick details and your ticket is ready. No appointment needed."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/70 shadow-soft">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-3">
                <Label>Choose a service</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((svc) => {
                    const active = selected === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setSelected(svc.id)}
                        aria-pressed={active}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          active
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/50 hover:bg-secondary/60"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">{svc.name}</span>
                          <span className="text-sm text-primary">${svc.price}</span>
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {svc.durationMin} min
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Get my ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/40">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Right now</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Customers waiting</dt>
                <dd className="font-display text-xl font-semibold">{waiting.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Estimated wait</dt>
                <dd className="font-display text-xl font-semibold">{estimate} min</dd>
              </div>
              {chosen && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Your service time</dt>
                  <dd className="font-display text-xl font-semibold">{chosen.durationMin} min</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
