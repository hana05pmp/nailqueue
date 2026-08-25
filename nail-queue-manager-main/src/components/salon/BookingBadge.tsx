import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/salon/types";

const styles: Record<BookingStatus, string> = {
  confirmed: "bg-info text-info-foreground",
  waiting: "bg-secondary text-secondary-foreground",
  serving: "bg-gradient-primary text-primary-foreground",
  completed: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const labels: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  waiting: "Waiting",
  serving: "In Service",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge className={`${styles[status]} border-transparent`} variant="secondary">
      {labels[status]}
    </Badge>
  );
}
