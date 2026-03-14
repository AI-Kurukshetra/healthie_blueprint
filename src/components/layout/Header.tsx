"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navConfig, type UserRole } from "@/config/nav";
import { MobileSidebar } from "./Sidebar";

interface HeaderProps {
  avatarUrl?: string | null;
  notifications: HeaderNotification[];
  role: UserRole;
  userEmail: string;
  userName: string;
}

interface HeaderNotification {
  createdAt: string;
  id: string;
  message: string;
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

export function Header({ avatarUrl, notifications, role, userEmail, userName }: HeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const activeNavItem = navConfig[role].find((item) => {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar avatarUrl={avatarUrl} role={role} userEmail={userEmail} userName={userName} />
        <div>
          <p className="text-sm text-muted-foreground capitalize">{role} Workspace</p>
          <h1 className="text-base font-semibold">{activeNavItem?.label ?? "Dashboard"}</h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Open notifications" className="relative" size="icon" variant="ghost">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 ? (
                <Button
                  className="text-xs h-auto p-0"
                  onClick={() => setReadIds(notifications.map((n) => n.id))}
                  variant="ghost"
                >
                  Read All
                </Button>
              ) : null}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">All caught up!</div>
            ) : (
              notifications.map((notification) => {
                const isRead = readIds.includes(notification.id);
                return (
                  <DropdownMenuItem
                    className="flex flex-col items-start gap-1 whitespace-normal py-2"
                    key={notification.id}
                    onSelect={() => {
                      if (!isRead) {
                        setReadIds((prev) => [...prev, notification.id]);
                      }
                    }}
                  >
                    <p className={isRead ? "text-muted-foreground" : "font-medium"}>{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          size="icon"
          type="button"
          variant="ghost"
        >
          {mounted ? (
            isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

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
              <LogoutButton className="w-full justify-start" variant="ghost" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
