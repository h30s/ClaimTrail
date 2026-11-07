import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CheckSquare,
  FileText,
  FolderCog,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  badge?: number;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/claims", label: "Claims", icon: FileText },
  { href: "/inbox", label: "Query Inbox", icon: Inbox },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/settings/checklists",
    label: "Checklist Rules",
    icon: CheckSquare,
    permission: "settings:manage",
  },
  {
    href: "/settings/document-types",
    label: "Document Types",
    icon: FolderCog,
    permission: "settings:manage",
  },
  {
    href: "/settings/payers",
    label: "Payers",
    icon: Building2,
    permission: "settings:manage",
  },
  {
    href: "/audit",
    label: "Audit Log",
    icon: ShieldCheck,
    permission: "audit:view",
  },
] as const;
