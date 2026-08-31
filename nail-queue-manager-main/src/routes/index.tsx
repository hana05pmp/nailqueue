import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, ListOrdered, Sparkles, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/salon/StatCard";
import { computeStats } from "@/lib/salon/stats";
import { nowServing, serviceName, useSalonState, waitingTickets } from "@/lib/salon/store";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "The Nail Room — Nail Salon Queue Management" }, { name: "description", content: "Choose a nail service, join the queue and track your wait." }] }),
  component: Home,
});

function Home() {
  const state = useSalonState();
  const stats = computeStats(state);
  const serving = nowServing(state);
  const waiting = waitingTickets(state);
  const services = state.services.filter((svc) => svc.active);

  return (
    <div>
      <section className="bg-blush">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium tracking-wide uppercase"><Sparkles className="size-3.5" /> Walk-in friendly</span>
            <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-5xl">Beautiful nails, without the waiting room</h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">Choose your service, take a digital ticket and watch your place in line update live.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/join" className={buttonVariants({ size: "lg" })}>Join the queue</Link></div>
          </div>
          <Card className="border-border/60 shadow-soft"><CardContent className="p-6 sm:p-8"><p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Now serving</p><p className="font-display mt-2 text-6xl font-semibold">{serving ? `#${serving.number}` : "—"}</p><p className="mt-1 text-sm text-muted-foreground">{serving ? `${serving.customerName} · ${serviceName(state, serving.serviceId)}` : "No client in the chair right now"}</p><div className="mt-6 border-t border-border/70 pt-6"><p className="text-xs text-muted-foreground">In line</p><p className="font-display text-2xl font-semibold">{waiting.length}</p></div></CardContent></Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Choose your treatment</p><h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Popular services</h2><p className="mt-2 text-sm text-muted-foreground">Pick a service and join the queue with it already selected.</p></div><Link to="/services" className={buttonVariants({ variant: "ghost" })}>See all <ArrowRight className="ml-1 size-4" /></Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((svc) => <Card key={svc.id} className="border-border/70 shadow-soft"><CardContent className="p-6"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold">{svc.name}</h3><span className="font-display font-semibold text-primary">{(svc.price * 1000).toLocaleString()} Ks</span></div><p className="mt-2 min-h-10 text-sm text-muted-foreground">{svc.description}</p><p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3.5" /> {formatDuration(svc.durationMin)}</p><Link to="/join" search={{ service: svc.id }} className={buttonVariants({ className: "mt-4 w-full" })}>Choose this service</Link></CardContent></Card>)}
          {services.length === 0 && <Card className="sm:col-span-2 lg:col-span-3"><CardContent className="p-8 text-center text-sm text-muted-foreground">No services are currently available.</CardContent></Card>}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6"><h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{[{ icon: Sparkles, title: "Choose a service", body: "Pick the treatment you want before joining the queue." }, { icon: ListOrdered, title: "Take a ticket", body: "Enter your name and get a unique queue number instantly." }, { icon: Clock, title: "Track your wait", body: "See customers ahead of you and your estimated waiting time." }].map((step) => <Card key={step.title} className="border-border/70"><CardContent className="p-6"><span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><step.icon className="size-5" /></span><h3 className="mt-4 text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm text-muted-foreground">{step.body}</p></CardContent></Card>)}</div></section>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6"><h2 className="text-2xl font-semibold sm:text-3xl">Today at the salon</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total tickets" value={stats.total} icon={ListOrdered} /><StatCard label="Waiting now" value={stats.waiting} icon={Users} /><StatCard label="Served" value={stats.served} icon={Sparkles} /><StatCard label="Avg. service" value={formatDuration(stats.avgServiceMin)} icon={Clock} /></div></section>
    </div>
  );
}
