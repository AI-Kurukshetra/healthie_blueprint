export default function ProviderPatientNotFound() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Patient not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The requested patient does not exist or is not assigned to you.</p>
    </div>
  );
}
