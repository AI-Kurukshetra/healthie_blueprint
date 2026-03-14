import type { ReactNode } from "react";
import { Stethoscope } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-10">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="rounded-xl bg-primary/15 p-2 text-primary">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">CareSync</span>
        </div>
        {children}
      </div>
    </div>
  );
}
