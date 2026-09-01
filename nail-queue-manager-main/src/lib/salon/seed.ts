import type { SalonState, Service } from "./types";

export const SERVICE_SEED: Service[] = [
  {
    id: "svc-classic-mani",
    name: "Classic Manicure",
    description: "Shaping, cuticle care, buff and a glossy polish finish.",
    durationMin: 30,
    price: 25,
    active: true,
  },
  {
    id: "svc-gel-mani",
    name: "Gel Manicure",
    description: "Long-lasting gel colour cured to a mirror shine.",
    durationMin: 45,
    price: 40,
    active: true,
  },
  {
    id: "svc-pedicure",
    name: "Spa Pedicure",
    description: "Warm soak, exfoliation, massage and polish.",
    durationMin: 50,
    price: 45,
    active: true,
  },
  {
    id: "svc-acrylic",
    name: "Acrylic Full Set",
    description: "Sculpted acrylic extensions shaped to your style.",
    durationMin: 75,
    price: 65,
    active: true,
  },
  {
    id: "svc-nail-art",
    name: "Nail Art Add-On",
    description: "Hand-painted detail, chrome, or crystal accents.",
    durationMin: 20,
    price: 15,
    active: true,
  },
  {
    id: "svc-removal",
    name: "Soak-Off & Repair",
    description: "Gentle removal with nourishing nail repair treatment.",
    durationMin: 25,
    price: 18,
    active: true,
  },
];

export function createSeedState(): SalonState {
  return {
    services: SERVICE_SEED,
    tickets: [],
    counter: 100,
    myTicketIds: [],
    staffLoggedIn: false,
    bookings: [],
    bookingCounter: 5000,
    myBookingIds: [],
  };
}
