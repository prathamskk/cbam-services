"use client";

import { SignOutButton } from "@/components/cbam/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CircleDollarSign,
  Container,
  Factory,
  Globe,
  Menu,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Globe },
  { href: "/shipments", label: "Shipment register", icon: Container },
  { href: "/documents", label: "Evidence vault", icon: ShieldCheck },
  { href: "/liability", label: "Liability modeler", icon: CircleDollarSign },
  { href: "/suppliers", label: "Suppliers", icon: Factory },
] as const;

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: (typeof nav)[number];
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: sticky bar + menu in dialog */}
      <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar/95 px-3 py-2.5 backdrop-blur-md md:hidden">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <ShieldCheck className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">CBAM</span>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0 border-sidebar-border"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" aria-hidden />
        </Button>
      </header>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          showCloseButton
          className="fixed top-0 right-0 left-auto flex h-[100dvh] max-h-[100dvh] w-[min(100vw-1rem,20rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-r-0 p-0 sm:rounded-l-xl sm:border"
        >
          <DialogHeader className="border-b border-border px-4 py-3 text-left">
            <DialogTitle className="font-heading text-lg">Navigate</DialogTitle>
          </DialogHeader>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavLink
                  key={item.href}
                  item={item}
                  active={active}
                  onNavigate={() => setMobileOpen(false)}
                />
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <SignOutButton />
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
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

        <nav className="flex flex-1 flex-col gap-0.5 p-2 py-3">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <NavLink key={item.href} item={item} active={active} />;
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
