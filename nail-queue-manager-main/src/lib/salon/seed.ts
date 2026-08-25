import type { SalonState, Service, Ticket } from "./types";

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

const MIN = 60_000;

function buildSeedTickets(now: number): Ticket[] {
  const t = (
    n: number,
    customerName: string,
    serviceId: string,
    status: Ticket["status"],
    offsets: { joined: number; called?: number; started?: number; ended?: number },
    walkIn = false,
  ): Ticket => ({
    id: `seed-${n}`,
    number: n,
    customerName,
    serviceId,
    status,
    walkIn,
    joinedAt: now - offsets.joined * MIN,
    calledAt: offsets.called !== undefined ? now - offsets.called * MIN : undefined,
    startedAt: offsets.started !== undefined ? now - offsets.started * MIN : undefined,
    endedAt: offsets.ended !== undefined ? now - offsets.ended * MIN : undefined,
  });

  return [
    t(101, "Amelia Chen", "svc-gel-mani", "completed", {
      joined: 260,
      called: 250,
      started: 248,
      ended: 205,
    }),
    t(102, "Priya Nair", "svc-pedicure", "completed", {
      joined: 245,
      called: 205,
      started: 203,
      ended: 150,
    }),
    t(103, "Jordan Blake", "svc-classic-mani", "cancelled", { joined: 230, ended: 210 }),
    t(104, "Sofia Rossi", "svc-acrylic", "completed", {
      joined: 200,
      called: 150,
      started: 148,
      ended: 70,
    }),
    t(105, "Mei Lin", "svc-nail-art", "completed", {
      joined: 150,
      called: 70,
      started: 68,
      ended: 45,
    }),
    t(106, "Hannah Ford", "svc-classic-mani", "skipped", { joined: 120, called: 60, ended: 55 }),
    t(107, "Zoe Martins", "svc-gel-mani", "serving", { joined: 60, called: 22, started: 20 }),
    t(108, "Daniel Osei", "svc-pedicure", "waiting", { joined: 40 }),
    t(109, "Leila Haddad", "svc-acrylic", "waiting", { joined: 25 }, true),
    t(110, "Grace Kim", "svc-nail-art", "waiting", { joined: 12 }),
  ];
}

export function createSeedState(now = Date.now()): SalonState {
  return {
    services: SERVICE_SEED,
    tickets: buildSeedTickets(now),
    counter: 110,
    myTicketIds: [],
    staffLoggedIn: false,
  };
}
