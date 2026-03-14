"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "@/app/(dashboard)/provider/appointments/actions";
import { PendingSubmitButton } from "@/components/shared/PendingSubmitButton";
import type { AppointmentStatus } from "@/lib/validations/appointment";

interface AppointmentDetailActionsProps {
  appointmentId: string;
  status: AppointmentStatus;
}

export function AppointmentDetailActions({ appointmentId, status }: AppointmentDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "scheduled" ? (
        <form action={updateAppointmentStatus.bind(null, appointmentId, "completed")}>
          <PendingSubmitButton pendingText="Saving..." type="submit">
            Mark Complete
          </PendingSubmitButton>
        </form>
      ) : null}

      {status !== "cancelled" ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel appointment?</DialogTitle>
              <DialogDescription>
                This will set the appointment status to cancelled. You can still open the appointment later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <form action={updateAppointmentStatus.bind(null, appointmentId, "cancelled")}>
                <PendingSubmitButton pendingText="Cancelling..." type="submit" variant="destructive">
                  Confirm Cancel
                </PendingSubmitButton>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
