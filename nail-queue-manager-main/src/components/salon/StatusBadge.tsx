import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/salon/types";

const styles: Record<TicketStatus, string> = {
  waiting: "bg-secondary text-secondary-foreground",
  called: "bg-warning text-warning-foreground",
  serving: "bg-gradient-primary text-primary-foreground",
  completed: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  skipped: "bg-muted text-muted-foreground",
};

const labels: Record<TicketStatus, string> = {
  waiting: "Waiting",
  called: "Called",
  serving: "In service",
  completed: "Completed",
  cancelled: "Cancelled",
  skipped: "Skipped",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge className={`${styles[status]} border-transparent`} variant="secondary">
      {labels[status]}
    </Badge>
  );
}
