"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
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
        <h1 className="font-heading text-2xl font-bold tracking-tight">Вход</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Пришлём ссылку для входа на почту — пароль не нужен.
        </p>
      </div>
      <Card>
        <CardContent>
          {status === "sent" ? (
            <p className="text-sm">
              Проверьте почту <span className="font-medium">{email}</span> и перейдите по ссылке
              из письма.
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
              {status === "error" && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Отправляем..." : "Отправить ссылку"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
