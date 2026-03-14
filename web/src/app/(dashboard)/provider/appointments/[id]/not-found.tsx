export default function ProviderAppointmentNotFound() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Appointment not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This appointment does not exist or is not available to your account.</p>
    </div>
  );
}
