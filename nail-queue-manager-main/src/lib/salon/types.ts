export type TicketStatus =
  | "waiting"
  | "called"
  | "serving"
  | "completed"
  | "cancelled"
  | "skipped";

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  active: boolean;
}

export interface Ticket {
  id: string;
  number: number;
  customerName: string;
  serviceId: string;
  status: TicketStatus;
  walkIn: boolean;
  joinedAt: number;
  calledAt?: number;
  startedAt?: number;
  endedAt?: number;
}

export interface SalonState {
  services: Service[];
  tickets: Ticket[];
  counter: number;
  myTicketIds: string[];
  staffLoggedIn: boolean;
}

export const ACTIVE_STATUSES: TicketStatus[] = ["waiting", "called", "serving"];
