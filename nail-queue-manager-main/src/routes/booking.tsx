import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarIcon, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { PageShell } from "@/components/salon/PageShell";
import { BookingBadge } from "@/components/salon/BookingBadge";
import {
  createBooking,
  getAvailableSlots,
  getOccupiedSlots,
  useSalonState,
} from "@/lib/salon/store";
import {
  formatDateLong,
  formatDuration,
  formatTime12h,
  todayDateStr,
} from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book an Appointment — Lacquer Lane" },
      {
        name: "description",
        content:
          "Book a nail salon appointment in advance. Choose your service, date and time slot.",
      },
      { property: "og:title", content: "Book an Appointment — Lacquer Lane" },
      {
        property: "og:description",
        content: "Reserve a nail salon appointment at your preferred date and time.",
      },
    ],
  }),
  component: BookingPage,
});

type Step = 1 | 2 | 3 | 4;

function BookingPage() {
  const { service } = Route.useSearch();
  const state = useSalonState();
  const services = state.services.filter((s) => s.active);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState<string | undefined>(service);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | undefined>(undefined);
  const [confirmedId, setConfirmedId] = useState<string | undefined>(undefined);

  const chosenService = services.find((s) => s.id === serviceId);
  const dateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";
  const today = todayDateStr();
  const isPastOrInvalidDate =
    !dateStr || dateStr < today;

  const { available, occupied } = useMemo(() => {
    if (!chosenService || isPastOrInvalidDate) return { available: [], occupied: [] };
    return {
      available: getAvailableSlots(state, dateStr, chosenService.durationMin),
      occupied: getOccupiedSlots(state, dateStr, chosenService.durationMin),
    };
  }, [state, dateStr, chosenService, isPastOrInvalidDate]);

  function next() {
    if (step === 1 && !serviceId) return toast.error("Please choose a service");
    if (step === 2 && !selectedDate) return toast.error("Please select a date");
    if (step === 3 && !slot) return toast.error("Please select a time slot");
    setStep((s) => (s + 1) as Step);
  }
  function back() {
    setStep((s) => Math.max(1, (s - 1)) as Step);
  }

  function confirm() {
    if (!name.trim()) return toast.error("Please enter your name");
    if (!serviceId || !dateStr || !slot) return;
    if (!chosenService) return;
    const result = createBooking({
      customerName: name,
      serviceId,
      date: dateStr,
      startTime: slot,
    });
    if (!result.ok) {
      setSlot(undefined);
      return toast.error(result.error);
    }
    setConfirmedId(result.booking.id);
    toast.success(`Booking confirmed! #${result.booking.bookingNumber}`);
  }

  const confirmedBooking = confirmedId
    ? state.bookings.find((b) => b.id === confirmedId)
    : undefined;

  const disabledBefore = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const stepLabel: Record<Step, string> = {
    1: "Choose Service",
    2: "Choose Date",
    3: "Choose Time",
    4: "Confirm Booking",
  };

  return (
    <PageShell
      title="Book an appointment"
      subtitle="Pick a service, choose a date and reserve an available time slot."
      action={
        <Link to="/join" className={buttonVariants({ variant: "outline" })}>
          Join the queue instead
        </Link>
      }
    >
      {confirmedBooking ? (
        <Card className="border-border/70 bg-blush">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-success" />
              <div>
                <p className="text-sm font-medium text-success">Booking confirmed</p>
                <h2 className="font-display text-2xl font-semibold">
                  Booking #{confirmedBooking.bookingNumber}
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="mt-1 font-semibold">{confirmedBooking.customerName}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="mt-1 font-semibold">{confirmedBooking.serviceName}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="mt-1 font-semibold">{formatDateLong(confirmedBooking.date)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="mt-1 font-semibold">
                  {formatTime12h(confirmedBooking.startTime)} – {formatTime12h(confirmedBooking.endTime)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="mt-1 font-semibold">{formatDuration(confirmedBooking.durationMin)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">
                  <BookingBadge status={confirmedBooking.status} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/my-bookings" className={buttonVariants()}>
                View my bookings
              </Link>
              <Link to="/" className={buttonVariants({ variant: "outline" })}>
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 overflow-x-auto">
            <ol className="flex min-w-max items-center gap-2 text-sm">
              {[1, 2, 3, 4].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={`inline-flex size-7 items-center justify-center rounded-full border text-xs font-semibold ${
                      step >= s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {s}
                  </span>
                  <span
                    className={
                      step >= s ? "font-medium text-foreground" : "text-muted-foreground"
                    }
                  >
                    {stepLabel[s as Step]}
                  </span>
                  {s < 4 && <ChevronRight className="size-4 text-muted-foreground" />}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="border-border/70 shadow-soft">
              <CardContent className="p-6 sm:p-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Step 1 — Choose a service</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Select the nail treatment you'd like to book.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((svc) => {
                        const active = serviceId === svc.id;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => setServiceId(svc.id)}
                            aria-pressed={active}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              active
                                ? "border-primary bg-secondary ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50 hover:bg-secondary/60"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-medium">{svc.name}</span>
                              <span className="text-sm text-primary">${svc.price}</span>
                            </span>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {svc.description}
                            </p>
                            <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" /> {formatDuration(svc.durationMin)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Step 2 — Choose a date</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pick a day for your appointment. Past dates are disabled.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(d) => d < disabledBefore}
                        initialFocus
                      />
                    </div>
                    {selectedDate && (
                      <div className="rounded-lg border bg-secondary/40 p-4">
                        <p className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="size-4 text-primary" />
                          <span className="font-medium">Selected:</span>
                          <span>{formatDateLong(dateStr)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Step 3 — Choose a time</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {chosenService
                          ? `For ${chosenService.name} (${formatDuration(chosenService.durationMin)})`
                          : ""}
                        {" on "}{formatDateLong(dateStr)}.
                      </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-medium text-success">
                          Available ({available.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {available.length === 0 && (
                            <p className="col-span-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                              No available slots for this date.
                            </p>
                          )}
                          {available.map((s) => {
                            const selected = slot === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setSlot(s)}
                                aria-pressed={selected}
                                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/20"
                                    : "border-success/40 bg-success/10 text-success-foreground hover:bg-success/20"
                                }`}
                              >
                                {formatTime12h(s)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-destructive">
                          Occupied ({occupied.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {occupied.length === 0 && (
                            <p className="col-span-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                              All slots available.
                            </p>
                          )}
                          {occupied.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive/70 line-through opacity-70"
                            >
                              {formatTime12h(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Step 4 — Confirm booking</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Review your appointment details and confirm.
                      </p>
                    </div>
                    <div className="space-y-3 rounded-xl border p-4 sm:p-6">
                      <div className="space-y-2">
                        <Label htmlFor="cust-name">Your name</Label>
                        <Input
                          id="cust-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          autoComplete="name"
                        />
                      </div>
                      <div className="grid gap-3 pt-2 sm:grid-cols-2">
                        <div className="rounded-lg bg-secondary/40 p-3">
                          <p className="text-xs text-muted-foreground">Service</p>
                          <p className="mt-1 font-semibold">{chosenService?.name}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/40 p-3">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="mt-1 font-semibold">
                            {chosenService ? formatDuration(chosenService.durationMin) : ""}
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary/40 p-3">
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="mt-1 font-semibold">{formatDateLong(dateStr)}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/40 p-3">
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="mt-1 font-semibold">
                            {slot ? formatTime12h(slot) : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 1}
                    className={buttonVariants({
                      variant: "outline",
                      className: step === 1 ? "invisible" : "",
                    })}
                  >
                    Back
                  </button>
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={next}
                      className={buttonVariants({ className: "ml-auto" })}
                    >
                      Continue
                      <ChevronRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={confirm}
                      className={buttonVariants({ className: "ml-auto" })}
                    >
                      Confirm booking
                      <CheckCircle2 className="size-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-secondary/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Booking summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-medium text-right">
                      {chosenService?.name ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium text-right">
                      {chosenService ? formatDuration(chosenService.durationMin) : "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium text-right">
                      {dateStr ? formatDateLong(dateStr) : "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">Time</dt>
                    <dd className="font-medium text-right">
                      {slot ? formatTime12h(slot) : "—"}
                    </dd>
                  </div>
                  {chosenService && (
                    <div className="flex items-start justify-between gap-2 border-t pt-3">
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="font-display text-xl font-semibold text-primary">
                        ${chosenService.price}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
}
