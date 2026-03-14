"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type UserRole } from "@/config/nav";
import { MobileSidebar } from "./Sidebar";

interface HeaderProps {
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

export function Header({ avatarUrl, role, userEmail, userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar avatarUrl={avatarUrl} role={role} userEmail={userEmail} userName={userName} />
        <div>
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-base font-semibold capitalize">{role} Workspace</h1>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2" variant="ghost">
            <Avatar className="h-8 w-8">
              {avatarUrl ? <AvatarImage alt={userName} src={avatarUrl} /> : null}
              <AvatarFallback>{getInitials(userName) || "CS"}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm md:inline">{userName}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut} className="w-full">
              <button className="w-full text-left" type="submit">
                Logout
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
