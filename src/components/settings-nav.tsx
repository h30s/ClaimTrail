"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const SETTINGS_LINKS = [
  { href: "/settings/checklists", label: "Checklist Rules" },
  { href: "/settings/document-types", label: "Document Types" },
  { href: "/settings/payers", label: "Payers" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="border-border flex border-b">
      {SETTINGS_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:border-border border-transparent",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
