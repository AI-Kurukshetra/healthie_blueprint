import { Toaster as SonnerToaster, toast } from "sonner";
import type { ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      className={cn("toaster group", className)}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "group toast flex w-full items-center gap-2 rounded-md border border-border bg-background p-4 text-sm text-foreground shadow-lg",
          title: "text-sm font-semibold text-foreground",
          description: "text-xs text-muted-foreground",
          actionButton:
            "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground",
          cancelButton: "inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
