"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Stethoscope } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { PendingSubmitButton } from "@/components/shared/PendingSubmitButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navConfig, type UserRole } from "@/config/nav";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  avatarUrl?: string | null;
  role: UserRole;
  userEmail: string;
  userName: string;
}

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "border-transparent bg-slate-100 text-slate-700",
  patient: "border-transparent bg-teal-100 text-teal-700",
  provider: "border-transparent bg-emerald-100 text-emerald-700",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SidebarBody({ avatarUrl, role, userEmail, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex items-center gap-2 px-4 py-6">
        <div className="rounded-xl bg-[hsl(var(--sidebar-accent))]/20 p-2 text-[hsl(var(--sidebar-accent))]">
          <Stethoscope className="h-5 w-5" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">CareSync</span>
      </div>

      <nav className="space-y-1 px-3">
        {navConfig[role].map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border-l-2 border-transparent px-3 py-2 text-sm font-medium text-[hsl(var(--sidebar-foreground))] transition-colors",
                "hover:bg-white/5 hover:text-white",
                isActive && "border-[hsl(var(--sidebar-accent))] bg-white/5 text-[hsl(var(--sidebar-accent))]"
              )}
              href={item.href}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="space-y-3 border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {avatarUrl ? <AvatarImage alt={userName} src={avatarUrl} /> : null}
            <AvatarFallback>{getInitials(userName) || "CS"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-xs text-[hsl(var(--sidebar-foreground))]/70">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={cn("capitalize", ROLE_BADGE_CLASSES[role])} variant="secondary">
            {role}
          </Badge>
          <form action={signOut}>
            <PendingSubmitButton
              className="text-[hsl(var(--sidebar-foreground))] hover:bg-white/10 hover:text-white"
              pendingText="Logging out..."
              size="sm"
              type="submit"
              variant="ghost"
            >
              Logout
            </PendingSubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[hsl(var(--sidebar-background))] md:block">
      <SidebarBody {...props} />
    </aside>
  );
}

export function MobileSidebar(props: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label="Open sidebar menu" className="md:hidden" size="icon" variant="ghost">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-72 border-r-0 p-0" side="left">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Role based navigation</SheetDescription>
        </SheetHeader>
        <SidebarBody {...props} />
      </SheetContent>
    </Sheet>
  );
}
