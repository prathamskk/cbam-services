import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/shipments", label: "Shipment register" },
  { href: "/documents", label: "Evidence vault" },
  { href: "/liability", label: "Liability modeler" },
  { href: "/suppliers", label: "Suppliers" },
] as const;

export function MainNav() {
  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
