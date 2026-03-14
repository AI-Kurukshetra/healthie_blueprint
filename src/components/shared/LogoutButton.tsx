"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button, type ButtonProps } from "@/components/ui/button";

interface LogoutButtonProps extends ButtonProps {
  pendingText?: string;
}

export function LogoutButton({
  children = "Logout",
  pendingText = "Logging out...",
  ...props
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await signOut();
      router.push("/login");
    });
  }

  return (
    <Button disabled={pending} onClick={handleLogout} type="button" {...props}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? pendingText : children}
    </Button>
  );
}
