import { AppSidebar } from "@/components/cbam/app-sidebar";
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
    <div className="flex min-h-svh flex-col bg-muted/25 md:flex-row">
      <AppSidebar />
      <div className="importer-canvas flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
