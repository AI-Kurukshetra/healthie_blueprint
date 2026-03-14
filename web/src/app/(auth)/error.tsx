"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Unable to load authentication page</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Please retry. If the issue continues, refresh the browser.
      </p>
      <Button onClick={reset} type="button">
        Retry
      </Button>
    </main>
  );
}
