import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container, Factory, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Evidence vault",
    desc: "Supplier uploads with pending, verified, and rejected states tied to CN codes.",
  },
  {
    icon: Globe,
    title: "Threshold intelligence",
    desc: "Live mass roll-ups by CN code against your 50 t exemption model band.",
  },
  {
    icon: Container,
    title: "Shipment register",
    desc: "Immutable-style register: date, mass, supplier, and product for audit-ready trails.",
  },
  {
    icon: Factory,
    title: "Supplier portal",
    desc: "Opaque links so factories upload proof without seeing other vendors.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="importer-canvas relative min-h-svh overflow-hidden">
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[min(70vh,640px)] w-[min(90vw,720px)] rounded-full bg-[radial-gradient(closest-side,oklch(0.62_0.14_158/0.22),transparent)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(50vh,480px)] w-[min(80vw,560px)] rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.12_175/0.14),transparent)] blur-2xl"
        aria-hidden
      />

      <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
              <ShieldCheck className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              CBAM Evidence &amp; Liability
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign in
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              Enter workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-primary mb-4 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide uppercase">
              Compliance infrastructure layer
            </p>
            <h1 className="font-heading text-balance text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              <span className="text-foreground">CBAM Evidence</span>{" "}
              <span className="text-primary">&amp;</span>{" "}
              <span className="text-foreground">Liability</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
              One workspace for evidence chains, import thresholds, default-vs-actual liability, and
              mock EU registry export — built for importers who need more than a spreadsheet.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "sm:min-w-[200px]")}>
                Get started
              </Link>
              <a
                href="#pillars"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-primary/25 sm:min-w-[200px]",
                )}
              >
                See what&apos;s inside
              </a>
            </div>
          </div>

          <div
            id="pillars"
            className="mt-20 grid gap-4 sm:grid-cols-2 lg:mt-28 lg:grid-cols-4 lg:gap-5"
          >
            {pillars.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="group rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-border/60 bg-muted/30 py-8 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
              Importer sign in
            </Link>
            <span className="mx-2 opacity-50" aria-hidden>
              ·
            </span>
            Supplier access uses secure links from your workspace.
          </p>
        </footer>
      </main>
    </div>
  );
}
