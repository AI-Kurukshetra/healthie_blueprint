import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you are looking for has moved or never existed. Check the URL or head back home.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go to dashboard</Link>
      </Button>
    </main>
  );
}
