"use client";

import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircleAlert, Info, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Feedback =
  | { kind: "error"; title: string; message: string }
  | { kind: "success"; title: string; message: string }
  | { kind: "info"; title: string; message: string };

function LabelWithHint({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex shrink-0 rounded-full p-0.5 transition-colors"
          aria-label={`About ${label}`}
        >
          <Info className="size-3.5" aria-hidden />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px]">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  const isError = feedback.kind === "error";
  const isSuccess = feedback.kind === "success";

  return (
    <Alert
      variant={isError ? "destructive" : "default"}
      className={cn(
        "mt-4",
        isSuccess &&
          "border-emerald-200/80 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-50",
        feedback.kind === "info" &&
          "border-primary/25 bg-primary/5 text-foreground [&_[data-slot=alert-description]]:text-foreground/80",
      )}
    >
      {isError ? (
        <CircleAlert className="size-4 shrink-0" aria-hidden />
      ) : isSuccess ? (
        <MailCheck className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
      ) : (
        <Info className="size-4 shrink-0 text-primary" aria-hidden />
      )}
      <AlertTitle>{feedback.title}</AlertTitle>
      <AlertDescription>{feedback.message}</AlertDescription>
    </Alert>
  );
}

function isEmailNotConfirmedError(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("email not confirmed") ||
    m.includes("not confirmed") ||
    m.includes("confirm your email")
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("signin");
  const router = useRouter();

  function clearFeedback() {
    setFeedback(null);
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (isEmailNotConfirmedError(error.message)) {
        setFeedback({
          kind: "info",
          title: "Verify your email first",
          message:
            "This project requires email confirmation. Check your inbox (and spam) for a message from Supabase, click the link, then return here to sign in.",
        });
        return;
      }
      setFeedback({
        kind: "error",
        title: "Sign in failed",
        message: error.message,
      });
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setFeedback({
        kind: "error",
        title: "Could not create account",
        message: error.message,
      });
      return;
    }

    if (data.session) {
      setFeedback({
        kind: "success",
        title: "You’re signed in",
        message: "Email confirmation is off for this project — redirecting to your workspace.",
      });
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setFeedback({
      kind: "success",
      title: "Check your email",
      message: `We sent a confirmation link to ${email}. Open that email and tap “Confirm email” before signing in here.`,
    });
  }

  return (
    <div className="importer-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,oklch(0.55_0.14_158/0.18),transparent_55%)]"
        aria-hidden
      />
      <Card className="relative w-full max-w-md shadow-lg ring-1 ring-primary/15">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Importer sign in</CardTitle>
          <CardDescription>
            Compliance infrastructure for thresholds, evidence, and liability modelling.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setFeedback(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4 space-y-4">
              <form onSubmit={onSignIn} className="space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <LabelWithHint
                    htmlFor="email"
                    label="Email"
                    hint="Use the same email your importer workspace is tied to. This is your sign-in username."
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFeedback();
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <LabelWithHint
                    htmlFor="password"
                    label="Password"
                    hint="Use a unique passphrase for this app."
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFeedback();
                    }}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-4">
              <form onSubmit={onSignUp} className="space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <LabelWithHint
                    htmlFor="email2"
                    label="Email"
                    hint="You’ll receive a short confirmation email from Supabase (or your custom SMTP) with a secure link."
                  />
                  <Input
                    id="email2"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFeedback();
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <LabelWithHint
                    htmlFor="password2"
                    label="Password"
                    hint="At least 6 characters for Supabase default policy — prefer 12+ random characters from a password manager."
                  />
                  <Input
                    id="password2"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFeedback();
                    }}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <FeedbackBanner feedback={feedback} />
        </CardContent>
      </Card>
    </div>
  );
}
