"use client";

import { createSupplierFromForm } from "@/app/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function CreateSupplierForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    startTransition(async () => {
      try {
        await createSupplierFromForm(fd);
        toast.success("Supplier added");
        e.currentTarget.reset();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create supplier");
      } finally {
        setLoading(false);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3 sm:items-end">
      <div className="space-y-2 sm:col-span-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Factory name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" placeholder="CN" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="score">Maturity score (0–100)</Label>
        <Input id="score" name="score" type="number" min={0} max={100} step={1} />
      </div>
      <Button type="submit" disabled={loading || pending} className="sm:col-span-3 sm:w-auto">
        {loading || pending ? "Saving…" : "Add supplier"}
      </Button>
    </form>
  );
}
