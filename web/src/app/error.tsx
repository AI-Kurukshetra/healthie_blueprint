"use client";

import { useEffect } from "react";
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
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            Please refresh the page or try again. If the problem continues, contact the CareSync team.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
