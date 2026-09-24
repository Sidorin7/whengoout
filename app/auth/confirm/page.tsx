"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

// Verification must wait for an explicit click, not fire on page load: some mail
// providers (observed with @yandex.ru) prefetch/scan links in the confirmation email,
// which would silently burn the one-time token before the user ever opens it if this
// page verified automatically. See Supabase's "Email prefetching" docs.
export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmForm />
    </Suspense>
  );
}

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "verifying" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // `next` comes from the URL, so it's attacker-controllable — restrict it to the one
  // legitimate destination instead of passing it straight into a redirect (open-redirect risk).
  const rawNext = searchParams.get("next");
  const next = rawNext === "/auth/update-password" ? rawNext : "/";

  const canVerify = Boolean(code || (token_hash && type));

  async function handleConfirm() {
    setStatus("verifying");
    setErrorMessage("");

    const supabase = createClient();
    const { error } =
      token_hash && type
        ? await supabase.auth.verifyOtp({ type, token_hash })
        : await supabase.auth.exchangeCodeForSession(code!);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Подтверждение</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Нажмите кнопку ниже, чтобы завершить вход по ссылке из письма.
        </p>
      </div>
      <Card>
        <CardContent>
          {!canVerify ? (
            <p className="text-sm text-destructive">
              Ссылка недействительна или устарела — запросите новую.
            </p>
          ) : (
            <>
              {status === "error" && (
                <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
              )}
              <Button
                onClick={handleConfirm}
                disabled={status === "verifying"}
                className="w-full"
              >
                {status === "verifying" ? "Подтверждаем..." : "Подтвердить"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
