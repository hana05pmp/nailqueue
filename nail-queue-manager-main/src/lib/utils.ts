import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const clamped = Math.max(0, Math.round(minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return hours === 1 ? "1 hr" : `${hours} hrs`;
  const hrLabel = hours === 1 ? "hr" : "hrs";
  return `${hours} ${hrLabel} ${mins} min`;
}

export const SALON_HOURS = {
  open: 9,
  close: 18,
  slotIntervalMin: 30,
};

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime12h(timeHHmm: string): string {
  const [hStr, mStr] = timeHHmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
}

export function addMinutesToTime(timeHHmm: string, minutes: number): string {
  const [hStr, mStr] = timeHHmm.split(":");
  const total = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = SALON_HOURS.open; h < SALON_HOURS.close; h++) {
    for (let m = 0; m < 60; m += SALON_HOURS.slotIntervalMin) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return slots;
}

export function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function timeToMinutes(timeHHmm: string): number {
  const [h, m] = timeHHmm.split(":").map(Number);
  return h * 60 + m;
}

export function timesOverlap(
  aStart: string,
  aDuration: number,
  bStart: string,
  bDuration: number,
): boolean {
  const aS = timeToMinutes(aStart);
  const aE = aS + aDuration;
  const bS = timeToMinutes(bStart);
  const bE = bS + bDuration;
  return aS < bE && bS < aE;
}
