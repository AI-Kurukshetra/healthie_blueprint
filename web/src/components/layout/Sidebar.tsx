"use client";

import Link from "next/link";
import { Menu, Stethoscope } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
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
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-6">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Stethoscope className="h-5 w-5" />
        </div>
        <span className="text-base font-semibold">CareSync</span>
      </div>

      <nav className="space-y-1 px-3">
        {navConfig[role].map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-accent/50 hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
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

      <div className="space-y-3 border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {avatarUrl ? <AvatarImage alt={userName} src={avatarUrl} /> : null}
            <AvatarFallback>{getInitials(userName) || "CS"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
          <form action={signOut}>
            <Button size="sm" type="submit" variant="ghost">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background md:block">
      <SidebarBody {...props} />
    </aside>
  );
}

export function MobileSidebar(props: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="md:hidden" size="icon" variant="ghost">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-72 p-0" side="left">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Role based navigation</SheetDescription>
        </SheetHeader>
        <SidebarBody {...props} />
      </SheetContent>
    </Sheet>
  );
}
