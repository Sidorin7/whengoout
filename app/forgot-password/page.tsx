"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/update-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Сброс пароля</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Пришлём ссылку для сброса пароля на почту.
        </p>
      </div>
      <Card>
        <CardContent>
          {status === "sent" ? (
            <p className="text-sm">
              Проверьте почту <span className="font-medium">{email}</span> и перейдите по ссылке
              из письма, чтобы задать новый пароль.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Отправляем..." : "Отправить ссылку"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-foreground underline-offset-2 hover:underline">
              Вернуться ко входу
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
