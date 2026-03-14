"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, Stethoscope } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { bookAppointment } from "@/app/(dashboard)/patient/appointments/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentTypeSchema } from "@/lib/validations/appointment";
import { cn } from "@/lib/utils";

const bookingFormSchema = z.object({
  appointment_date: z.string().min(1, "Select a date"),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, "Select a time"),
  duration_minutes: z.coerce.number().min(15).max(120),
  notes: z.string().max(500).optional(),
  provider_id: z.string().uuid("Select a provider"),
  type: appointmentTypeSchema,
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface ProviderOption {
  bio: string | null;
  id: string;
  name: string;
  specialization: string | null;
}

interface BookAppointmentFormProps {
  providers: ProviderOption[];
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function BookAppointmentForm({ providers }: BookAppointmentFormProps) {
  const router = useRouter();

  const form = useForm<BookingFormValues>({
    defaultValues: {
      appointment_date: "",
      appointment_time: "",
      duration_minutes: 30,
      notes: "",
      provider_id: "",
      type: "initial",
    },
    resolver: zodResolver(bookingFormSchema),
  });

  const onSubmit = async (values: BookingFormValues) => {
    const formData = new FormData();
    formData.set("provider_id", values.provider_id);
    formData.set("appointment_date", values.appointment_date);
    formData.set("appointment_time", values.appointment_time);
    formData.set("duration_minutes", values.duration_minutes.toString());
    formData.set("type", values.type);
    formData.set("notes", values.notes ?? "");

    const result = await bookAppointment(formData);

    if (!result.success) {
      form.setError("root", { message: result.error });
      toast.error(result.error ?? "Unable to book appointment");
      return;
    }

    toast.success("Appointment booked successfully");
    router.push("/patient/appointments");
    router.refresh();
  };

  const selectedProviderId = form.watch("provider_id");

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">1. Select a Provider</h2>
            <p className="text-sm text-muted-foreground">Choose the care provider for your visit (required).</p>
          </div>
          <FormField
            control={form.control}
            name="provider_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid gap-3 md:grid-cols-2">
                    {providers.map((provider) => (
                      <button
                        key={provider.id}
                        className={cn(
                          "rounded-xl border border-input/80 p-4 text-left transition-colors hover:border-primary/60 hover:bg-accent/40",
                          field.value === provider.id && "border-primary bg-primary/5 ring-1 ring-primary/20"
                        )}
                        onClick={() => field.onChange(provider.id)}
                        type="button"
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Stethoscope className="h-4 w-4" />
                          {provider.specialization || "General Medicine"}
                        </div>
                        <p className="mt-2 text-sm font-semibold">{provider.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {provider.bio || "Experienced virtual care provider."}
                        </p>
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">2. Pick Date and Time</h2>
            <p className="text-sm text-muted-foreground">Appointments are available Monday to Friday, 9:00 to 17:00.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="appointment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date (required)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" min={new Date().toISOString().split("T")[0]} type="date" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointment_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time (required)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">3. Appointment Details</h2>
            <p className="text-sm text-muted-foreground">Add visit type and optional notes for your provider.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit type (required)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="initial">Initial</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (required)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes for provider (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={500}
                    placeholder="Share symptoms, concerns, or other details to help your provider prepare."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {form.formState.errors.root?.message ? (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href="/patient/appointments">Cancel</Link>
          </Button>
          <Button className="w-full sm:w-auto" disabled={form.formState.isSubmitting || !selectedProviderId} type="submit">
            {form.formState.isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
