"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { updateAppointmentStatus } from "@/app/(dashboard)/provider/appointments/actions";
import { PendingSubmitButton } from "@/components/shared/PendingSubmitButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppointmentStatus } from "@/lib/validations/appointment";

interface ProviderAppointmentRowActionsProps {
  appointmentId: string;
  status: AppointmentStatus;
}

export function ProviderAppointmentRowActions({ appointmentId, status }: ProviderAppointmentRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open appointment actions" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/provider/appointments/${appointmentId}`}>View Detail</Link>
        </DropdownMenuItem>

        {status !== "completed" ? (
          <DropdownMenuItem asChild>
            <form action={async () => { await updateAppointmentStatus(appointmentId, "completed"); }} className="w-full">
              <PendingSubmitButton className="w-full justify-start" pendingText="Saving..." type="submit" variant="ghost">
                Mark Complete
              </PendingSubmitButton>
            </form>
          </DropdownMenuItem>
        ) : null}

        {status !== "cancelled" ? (
          <DropdownMenuItem asChild>
            <form action={async () => { await updateAppointmentStatus(appointmentId, "cancelled"); }} className="w-full">
              <PendingSubmitButton className="w-full justify-start" pendingText="Saving..." type="submit" variant="ghost">
                Cancel
              </PendingSubmitButton>
            </form>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
