export type PortalId = "frontdesk" | "doctor" | "lab" | "pharmacy";

export type PortalConfig = {
  id: PortalId;
  title: string;
  route: string;
  description: string;
};

export const PORTALS: PortalConfig[] = [
  {
    id: "frontdesk",
    title: "Front Desk Portal",
    route: "/frontdesk",
    description: "Patient operations, scheduling, billing, queue, and coordination."
  },
  {
    id: "doctor",
    title: "Doctor Portal",
    route: "/doctor",
    description: "Consultations, notes, prescriptions, referrals, and follow-ups."
  },
  {
    id: "lab",
    title: "Lab Portal",
    route: "/lab",
    description: "Diagnostics orders, sample workflow, reports, and result management."
  },
  {
    id: "pharmacy",
    title: "Pharmacy Portal",
    route: "/pharmacy",
    description: "Inventory, fulfillment, POS, delivery coordination, and suppliers."
  }
];
