import Link from "next/link";

export default function PortalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-xl font-semibold">Invalid or expired link</h1>
        <p className="text-muted-foreground text-sm">
          Ask your importer for a new supplier portal URL.
        </p>
        <Link href="/login" className="text-primary text-sm underline underline-offset-4">
          Importer sign in
        </Link>
      </div>
    </div>
  );
}
