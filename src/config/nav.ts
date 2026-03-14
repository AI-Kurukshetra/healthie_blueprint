import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type UserRole = "patient" | "provider" | "admin";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const navConfig: Record<UserRole, NavItem[]> = {
  patient: [
    { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/patient/appointments", icon: Calendar },
    { label: "Health Records", href: "/patient/records", icon: FileText },
    { label: "Messages", href: "/patient/messages", icon: MessageSquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  provider: [
    { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
    { label: "Patients", href: "/provider/patients", icon: Users },
    { label: "Appointments", href: "/provider/appointments", icon: Calendar },
    { label: "Clinical Notes", href: "/provider/notes", icon: ClipboardList },
    { label: "Schedule", href: "/provider/schedule", icon: Activity },
    { label: "Messages", href: "/provider/messages", icon: MessageSquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};
