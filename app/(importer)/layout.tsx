import { SignOutButton } from "@/components/cbam/sign-out-button";
import { MainNav } from "@/components/cbam/main-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ImporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-semibold tracking-tight">CBAM Evidence &amp; Liability</span>
            <MainNav />
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
