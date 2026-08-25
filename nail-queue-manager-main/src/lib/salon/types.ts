export type TicketStatus =
  | "waiting"
  | "called"
  | "serving"
  | "completed"
  | "cancelled"
  | "skipped";

export type BookingStatus =
  | "confirmed"
  | "waiting"
  | "serving"
  | "completed"
  | "cancelled";

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

export interface Booking {
  id: string;
  bookingNumber: number;
  customerName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  status: BookingStatus;
  createdAt: number;
  checkedInAt?: number;
  startedAt?: number;
  endedAt?: number;
}

export interface SalonState {
  services: Service[];
  tickets: Ticket[];
  counter: number;
  myTicketIds: string[];
  staffLoggedIn: boolean;
  bookings: Booking[];
  bookingCounter: number;
  myBookingIds: string[];
}

export const ACTIVE_STATUSES: TicketStatus[] = ["waiting", "called", "serving"];
