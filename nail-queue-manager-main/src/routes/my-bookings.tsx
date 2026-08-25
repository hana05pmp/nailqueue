import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/salon/PageShell";
import { BookingBadge } from "@/components/salon/BookingBadge";
import { cancelBooking, myBookings, useSalonState } from "@/lib/salon/store";
import {
  formatDateLong,
  formatDuration,
  formatTime12h,
} from "@/lib/utils";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Lacquer Lane" },
      {
        name: "description",
        content:
          "View and manage your upcoming and past nail salon appointments.",
      },
      { property: "og:title", content: "My Bookings — Lacquer Lane" },
      {
        property: "og:description",
        content: "View and manage your nail salon appointments.",
      },
    ],
  }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const state = useSalonState();
  const mine = myBookings(state);
  const upcoming = mine.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const past = mine.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <PageShell
      title="My bookings"
      subtitle="All your scheduled appointments in one place."
      action={
        <Link to="/booking" className={buttonVariants({ variant: "outline" })}>
          Book a new appointment
        </Link>
      }
    >
      {mine.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <h2 className="text-lg font-semibold">No bookings yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Book an appointment to reserve a time slot in advance.
            </p>
            <Link to="/booking" className={buttonVariants({ className: "mt-6" })}>
              Book an appointment
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Upcoming</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border-border/70 shadow-soft"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs tracking-wide text-muted-foreground uppercase">
                            Booking
                          </p>
                          <p className="font-display text-4xl font-semibold">
                            #{booking.bookingNumber}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.customerName}
                          </p>
                        </div>
                        <BookingBadge status={booking.status} />
                      </div>
                      <div className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="size-3.5" />
                            Service
                          </span>
                          <span className="font-medium">{booking.serviceName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="size-3.5" />
                            Date
                          </span>
                          <span className="font-medium">
                            {formatDateLong(booking.date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="size-3.5" />
                            Time
                          </span>
                          <span className="font-medium">
                            {formatTime12h(booking.startTime)} –{" "}
                            {formatTime12h(booking.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="size-3.5" />
                            Duration
                          </span>
                          <span className="font-medium">
                            {formatDuration(booking.durationMin)}
                          </span>
                        </div>
                      </div>
                      {booking.status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => {
                            cancelBooking(booking.id);
                            toast.success(`Booking #${booking.bookingNumber} cancelled`);
                          }}
                          className={buttonVariants({
                            variant: "outline",
                            className: "mt-5 w-full",
                          })}
                        >
                          Cancel booking
                        </button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Past</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {past.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border-border/70 opacity-80"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs tracking-wide text-muted-foreground uppercase">
                            Booking
                          </p>
                          <p className="font-display text-3xl font-semibold">
                            #{booking.bookingNumber}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.serviceName}
                          </p>
                        </div>
                        <BookingBadge status={booking.status} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-3">
                        <span>{formatDateLong(booking.date)}</span>
                        <span>
                          {formatTime12h(booking.startTime)} – {formatTime12h(booking.endTime)}
                        </span>
                        <span>{formatDuration(booking.durationMin)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
