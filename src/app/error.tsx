"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-teal-50/40 px-6 py-12 text-foreground dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">CareSync</p>
          <h2 className="mt-2 text-2xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please try again. If the issue persists, return to a stable page and retry your action.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => reset()}>Try Again</Button>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
