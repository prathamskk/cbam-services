"use client";

import { SignOutButton } from "@/components/cbam/sign-out-button";
import { cn } from "@/lib/utils";
import {
  CircleDollarSign,
  Container,
  Factory,
  Globe,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Globe },
  { href: "/shipments", label: "Shipment register", icon: Container },
  { href: "/documents", label: "Evidence vault", icon: ShieldCheck },
  { href: "/liability", label: "Liability modeler", icon: CircleDollarSign },
  { href: "/suppliers", label: "Suppliers", icon: Factory },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col border-b border-sidebar-border bg-sidebar md:h-svh md:w-56 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
          aria-hidden
        >
          <ShieldCheck className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            CBAM
          </p>
          <p className="truncate text-xs text-muted-foreground">Evidence &amp; liability</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-row gap-0.5 overflow-x-auto px-2 py-2 md:flex-col md:px-2 md:py-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "whitespace-nowrap md:whitespace-normal",
                active
                  ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
