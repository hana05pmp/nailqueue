import { useSyncExternalStore } from "react";
import { createSeedState } from "./seed";
import type { SalonState, Service, Ticket, TicketStatus } from "./types";

const STORAGE_KEY = "nail-salon-queue-v1";
const serverState: SalonState = createSeedState(0);
let state: SalonState = serverState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SalonState>;
      state = { ...createSeedState(), ...parsed, staffLoggedIn: false };
    } else { state = createSeedState(); persist(); }
  } catch { state = createSeedState(); }
  emit();
}
function setState(updater: (prev: SalonState) => SalonState) { state = updater(state); persist(); emit(); }
function subscribe(listener: () => void) { hydrate(); listeners.add(listener); return () => listeners.delete(listener); }
export function useSalon<T>(selector: (s: SalonState) => T): T { return useSyncExternalStore(subscribe, () => selector(state), () => selector(serverState)); }
export function useSalonState(): SalonState { return useSyncExternalStore(subscribe, () => state, () => serverState); }
const uid = () => Math.random().toString(36).slice(2, 10);

export function joinQueue(customerName: string, serviceId: string, walkIn = false): Ticket {
  const number = state.counter + 1;
  const ticket: Ticket = { id: uid(), number, customerName: customerName.trim(), serviceId, status: "waiting", walkIn, joinedAt: Date.now() };
  setState((prev) => ({ ...prev, counter: number, tickets: [...prev.tickets, ticket], myTicketIds: walkIn ? prev.myTicketIds : [...prev.myTicketIds, ticket.id] }));
  return ticket;
}
export function cancelTicket(id: string) { updateTicket(id, { status: "cancelled", endedAt: Date.now() }); }
function updateTicket(id: string, patch: Partial<Ticket>) { setState((prev) => ({ ...prev, tickets: prev.tickets.map((t) => t.id === id ? { ...t, ...patch } : t) })); }
export function callNext() { const next = state.tickets.filter((t) => t.status === "waiting").sort((a, b) => a.joinedAt - b.joinedAt)[0]; if (!next) return null; updateTicket(next.id, { status: "called", calledAt: Date.now() }); return next; }
export function startService(id: string) { updateTicket(id, { status: "serving", startedAt: Date.now() }); }
export function completeService(id: string) { updateTicket(id, { status: "completed", endedAt: Date.now() }); }
export function skipTicket(id: string) { updateTicket(id, { status: "skipped", endedAt: Date.now() }); }

export function saveService(service: Service) {
  setState((prev) => ({ ...prev, services: prev.services.some((s) => s.id === service.id) ? prev.services.map((s) => s.id === service.id ? service : s) : [...prev.services, service] }));
}
export function newServiceId() { return `svc-${uid()}`; }
export function deleteService(id: string) { setState((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== id) })); }
export function toggleService(id: string) { setState((prev) => ({ ...prev, services: prev.services.map((s) => s.id === id ? { ...s, active: !s.active } : s) })); }

export const STAFF_CREDENTIALS = { username: "staff", password: "polish123" };
export function staffLogin(username: string, password: string) {
  const ok = username.trim().toLowerCase() === STAFF_CREDENTIALS.username && password === STAFF_CREDENTIALS.password;
  if (ok) setState((prev) => ({ ...prev, staffLoggedIn: true }));
  return ok;
}
export function staffLogout() { setState((prev) => ({ ...prev, staffLoggedIn: false })); }
export function resetDemoData() { setState(() => createSeedState()); }
export const byJoinedAt = (a: Ticket, b: Ticket) => a.joinedAt - b.joinedAt;
export function waitingTickets(s: SalonState) { return s.tickets.filter((t) => t.status === "waiting").sort(byJoinedAt); }
export function nowServing(s: SalonState) { return s.tickets.filter((t) => t.status === "serving").sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))[0] ?? null; }
export function calledTickets(s: SalonState) { return s.tickets.filter((t) => t.status === "called").sort(byJoinedAt); }
export function serviceName(s: SalonState, id: string) { return s.services.find((svc) => svc.id === id)?.name ?? "Service"; }
export function serviceDuration(s: SalonState, id: string) { return s.services.find((svc) => svc.id === id)?.durationMin ?? 30; }
export function positionOf(s: SalonState, ticket: Ticket) { const list = waitingTickets(s); const idx = list.findIndex((t) => t.id === ticket.id); return idx === -1 ? 0 : idx + 1; }
export function estimatedWaitMin(s: SalonState, ticket: Ticket) { const ahead = waitingTickets(s).filter((t) => t.joinedAt < ticket.joinedAt); const aheadMin = ahead.reduce((sum, t) => sum + serviceDuration(s, t.serviceId), 0); const serving = nowServing(s); let remaining = 0; if (serving) { const elapsed = (Date.now() - (serving.startedAt ?? Date.now())) / 60000; remaining = Math.max(0, serviceDuration(s, serving.serviceId) - elapsed); } return Math.round(aheadMin + remaining); }
