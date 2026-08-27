import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/salon/PageShell";
import { useSalon } from "@/lib/salon/store";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Nail Services & Prices — The Nail Room" },
      {
        name: "description",
        content:
          "Manicures, pedicures, acrylic sets and nail art at The Nail Room, with durations and prices.",
      },
      { property: "og:title", content: "Nail Services & Prices — The Nail Room" },
      {
        property: "og:description",
        content: "See every nail service we offer with duration and pricing.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = useSalon((s) => s.services.filter((svc) => svc.active));

  return (
    <PageShell
      title="Our services"
      subtitle="Every treatment includes shaping, cuticle care and a hand massage."
      action={
        <Link to="/join" className={buttonVariants()}>
          Join the queue
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => (
          <Card key={svc.id} className="flex flex-col border-border/70 shadow-soft">
            <CardContent className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{svc.name}</h2>
                <span className="font-display text-lg font-semibold text-primary">
                  ${svc.price}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{svc.description}</p>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> about {formatDuration(svc.durationMin)}
              </p>
              <Link
                to="/join"
                search={{ service: svc.id }}
                className={buttonVariants({ variant: "outline", className: "mt-4" })}
              >
                Book this
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
