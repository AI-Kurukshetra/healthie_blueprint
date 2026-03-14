import Link from "next/link";
import type { ElementType } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  href: string;
  label: string;
}

export interface EmptyStateProps {
  action?: EmptyStateAction;
  description: string;
  icon: ElementType;
  title: string;
}

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-background p-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
