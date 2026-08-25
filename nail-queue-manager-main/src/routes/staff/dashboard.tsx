import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/salon/PageShell";
import { StaffGuard } from "@/components/salon/StaffGuard";
import { BookingBadge } from "@/components/salon/BookingBadge";
import { bookingsForDate, callNext, checkInBooking, completeBookingService, completeService, joinQueue, nowServing, serviceName, skipTicket, startBookingService, startService, useSalonState, waitingTickets, staffLogout } from "@/lib/salon/store";
import { formatDuration, formatTime12h, todayDateStr } from "@/lib/utils";

export const Route = createFileRoute("/staff/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const state = useSalonState();
  const navigate = useNavigate();
  const [walkInName, setWalkInName] = useState("");
  const [walkInService, setWalkInService] = useState(state.services.find((s) => s.active)?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(todayDateStr());
  const waiting = waitingTickets(state);
  const serving = nowServing(state);
  const called = state.tickets.filter((t) => t.status === "called").sort((a, b) => a.calledAt! - b.calledAt!);
  const todayBookings = bookingsForDate(state, selectedDate).sort(
    (a, b) => a.startTime.localeCompare(b.startTime),
  );

  function walkIn(e: React.FormEvent) {
    e.preventDefault();
    if (!walkInName.trim() || !walkInService) return toast.error("Enter a name and choose a service");
    const ticket = joinQueue(walkInName, walkInService, true);
    setWalkInName("");
    toast.success(`Walk-in added as #${ticket.number}`);
  }

  function logout() { staffLogout(); navigate({ to: "/staff/login", replace: true }); }

  return <StaffGuard><PageShell title="Staff dashboard" subtitle="Manage today's live nail salon queue and scheduled appointments.">
    <div className="mb-6 flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => navigate({ to: "/staff/services" })}>Services</Button>
      <Button variant="outline" onClick={() => navigate({ to: "/staff/analytics" })}>Analytics</Button>
      <Button variant="ghost" onClick={logout}>Sign out</Button>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Waiting</p><p className="font-display text-4xl font-semibold">{waiting.length}</p><Button className="mt-4 w-full" onClick={() => { const t = callNext(); t ? toast.success(`Called #${t.number}`) : toast.info("No customers waiting"); }}>Call next</Button></CardContent></Card>
      <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Now serving</p><p className="mt-1 text-xl font-semibold">{serving ? `#${serving.number} — ${serving.customerName}` : "Nobody"}</p>{serving && <Button className="mt-4 w-full" onClick={() => { completeService(serving.id); toast.success("Service completed"); }}>Complete</Button>}</CardContent></Card>
      <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Called</p><p className="font-display text-4xl font-semibold">{called.length}</p>{called[0] && <Button className="mt-4 w-full" onClick={() => { startService(called[0].id); toast.success(`#${called[0].number} started`); }}>Start # {called[0].number}</Button>}</CardContent></Card>
    </div>

    <Card className="mt-6"><CardContent className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Today&apos;s bookings</h2>
          <p className="mt-1 text-sm text-muted-foreground">Appointments scheduled for the selected date.</p>
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="mt-4 space-y-3">
        {todayBookings.length === 0 && (
          <p className="text-sm text-muted-foreground">No bookings for this date.</p>
        )}
        {todayBookings.map((b) => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center min-w-16 rounded-lg bg-secondary/60 p-2">
                <p className="font-semibold">{formatTime12h(b.startTime)}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {formatDuration(b.durationMin)}
                </p>
              </div>
              <div>
                <p className="font-semibold">{b.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {b.serviceName} · Booking #{b.bookingNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookingBadge status={b.status} />
              {b.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    checkInBooking(b.id);
                    toast.success(`Booking #${b.bookingNumber} checked in`);
                  }}
                >
                  Check in
                </Button>
              )}
              {b.status === "waiting" && (
                <Button
                  size="sm"
                  onClick={() => {
                    startBookingService(b.id);
                    toast.success(`Booking #${b.bookingNumber} started`);
                  }}
                >
                  Start
                </Button>
              )}
              {b.status === "serving" && (
                <Button
                  size="sm"
                  onClick={() => {
                    completeBookingService(b.id);
                    toast.success(`Booking #${b.bookingNumber} completed`);
                  }}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent></Card>

    <Card className="mt-6"><CardContent className="p-6"><h2 className="text-lg font-semibold">Add walk-in</h2><form onSubmit={walkIn} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]"><div className="space-y-2"><Label htmlFor="walkin">Customer name</Label><Input id="walkin" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="walkin-service">Service</Label><select id="walkin-service" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={walkInService} onChange={(e) => setWalkInService(e.target.value)}>{state.services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><Button type="submit" className="self-end">Add walk-in</Button></form></CardContent></Card>
    <Card className="mt-6"><CardContent className="p-6"><h2 className="text-lg font-semibold">Waiting list</h2><div className="mt-4 space-y-3">{waiting.map((ticket) => <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-semibold">#{ticket.number} — {ticket.customerName}</p><p className="text-sm text-muted-foreground">{serviceName(state, ticket.serviceId)} · {ticket.walkIn ? "Walk-in" : "Online"}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => { skipTicket(ticket.id); toast.success(`#${ticket.number} skipped`); }}>Skip</Button><Button onClick={() => { startService(ticket.id); toast.success(`#${ticket.number} started`); }}>Start</Button></div></div>)}{waiting.length === 0 && <p className="text-sm text-muted-foreground">No customers waiting.</p>}</div></CardContent></Card>
  </PageShell></StaffGuard>;
}
