import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  LayoutDashboard,
  Megaphone,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Complaints", href: "/admin/complaints", icon: AlertTriangle },
  { label: "Residents", href: "/admin/residents", icon: Users },
  { label: "Notices", href: "/admin/notices", icon: Megaphone },
  { label: "Facilities", href: "/admin/facilities", icon: Wrench },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const residentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Complaints", href: "/complaints", icon: AlertTriangle },
  { label: "Notices", href: "/notices", icon: Bell },
  { label: "Facilities", href: "/facilities", icon: Calendar },
  { label: "Profile", href: "/profile", icon: User },
];

export const residentMobileNavItems = residentNavItems;

