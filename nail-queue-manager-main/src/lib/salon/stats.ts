import type { SalonState, Ticket } from "./types";

export interface QueueStats {
  total: number;
  waiting: number;
  served: number;
  cancelled: number;
  skipped: number;
  avgWaitMin: number;
  avgServiceMin: number;
  maxQueueLength: number;
}

const avg = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

export function computeStats(s: SalonState): QueueStats {
  const tickets = s.tickets;
  const served = tickets.filter((t) => t.status === "completed");

  const waitTimes = tickets
    .filter((t) => t.calledAt)
    .map((t) => ((t.calledAt as number) - t.joinedAt) / 60000);

  const serviceTimes = served
    .filter((t) => t.startedAt && t.endedAt)
    .map((t) => ((t.endedAt as number) - (t.startedAt as number)) / 60000);

  return {
    total: tickets.length,
    waiting: tickets.filter((t) => t.status === "waiting").length,
    served: served.length,
    cancelled: tickets.filter((t) => t.status === "cancelled").length,
    skipped: tickets.filter((t) => t.status === "skipped").length,
    avgWaitMin: avg(waitTimes),
    avgServiceMin: avg(serviceTimes),
    maxQueueLength: maxQueueLength(tickets),
  };
}

/** Replays join/leave events to find the largest simultaneous waiting count. */
export function maxQueueLength(tickets: Ticket[]): number {
  const events: { t: number; delta: number }[] = [];
  tickets.forEach((t) => {
    events.push({ t: t.joinedAt, delta: 1 });
    const left = t.calledAt ?? t.endedAt;
    if (left) events.push({ t: left, delta: -1 });
  });
  events.sort((a, b) => a.t - b.t || a.delta - b.delta);
  let cur = 0;
  let max = 0;
  events.forEach((e) => {
    cur += e.delta;
    if (cur > max) max = cur;
  });
  return max;
}

export function serviceBreakdown(s: SalonState) {
  return s.services
    .map((svc) => ({
      name: svc.name,
      count: s.tickets.filter((t) => t.serviceId === svc.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function hourlyJoins(s: SalonState) {
  const buckets = new Map<number, number>();
  s.tickets.forEach((t) => {
    const h = new Date(t.joinedAt).getHours();
    buckets.set(h, (buckets.get(h) ?? 0) + 1);
  });
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([h, count]) => ({ hour: `${String(h).padStart(2, "0")}:00`, count }));
}
