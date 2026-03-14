import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus, AppointmentType } from "@/lib/validations/appointment";
import type { MedicalRecordStatus, MedicalRecordType } from "@/lib/validations/medical-record";

type BadgeValue = AppointmentStatus | AppointmentType | MedicalRecordStatus | MedicalRecordType;

export interface StatusBadgeProps {
  className?: string;
  value: BadgeValue;
}

const STATUS_LABELS: Record<BadgeValue, string> = {
  active: "Active",
  cancelled: "Cancelled",
  completed: "Completed",
  condition: "Condition",
  consultation: "Consultation",
  discontinued: "Discontinued",
  follow_up: "Follow Up",
  initial: "Initial",
  allergy: "Allergy",
  medication: "Medication",
  no_show: "No Show",
  resolved: "Resolved",
  scheduled: "Scheduled",
};

const STATUS_CLASSES: Record<BadgeValue, string> = {
  active: "border-transparent bg-primary/15 text-primary",
  cancelled: "border-transparent bg-muted text-muted-foreground",
  completed: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  condition: "border-transparent bg-muted text-muted-foreground",
  consultation: "border-transparent bg-primary/15 text-primary",
  discontinued: "border-transparent bg-destructive/15 text-destructive",
  follow_up: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  initial: "border-transparent bg-muted text-foreground",
  allergy: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  medication: "border-transparent bg-primary/15 text-primary",
  no_show: "border-transparent bg-destructive/15 text-destructive",
  resolved: "border-transparent bg-muted text-muted-foreground",
  scheduled: "border-transparent bg-primary/15 text-primary",
};

export function StatusBadge({ className, value }: StatusBadgeProps) {
  return (
    <Badge className={cn(STATUS_CLASSES[value], className)} variant="outline">
      {STATUS_LABELS[value]}
    </Badge>
  );
}
