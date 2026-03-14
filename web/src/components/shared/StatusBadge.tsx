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
  active: "border-transparent bg-teal-50 text-teal-700",
  cancelled: "border-transparent bg-gray-100 text-gray-500",
  completed: "border-transparent bg-emerald-50 text-emerald-700",
  condition: "border-transparent bg-gray-100 text-gray-700",
  consultation: "border-transparent bg-teal-50 text-teal-700",
  discontinued: "border-transparent bg-red-50 text-red-600",
  follow_up: "border-transparent bg-emerald-50 text-emerald-700",
  initial: "border-transparent bg-slate-100 text-slate-700",
  allergy: "border-transparent bg-amber-50 text-amber-700",
  medication: "border-transparent bg-teal-50 text-teal-700",
  no_show: "border-transparent bg-red-50 text-red-600",
  resolved: "border-transparent bg-gray-100 text-gray-500",
  scheduled: "border-transparent bg-teal-50 text-teal-700",
};

export function StatusBadge({ className, value }: StatusBadgeProps) {
  return (
    <Badge className={cn(STATUS_CLASSES[value], className)} variant="outline">
      {STATUS_LABELS[value]}
    </Badge>
  );
}
