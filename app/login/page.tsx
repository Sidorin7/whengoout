"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const LINK_ERROR_MESSAGE = "Ссылка недействительна или устарела — запросите новую.";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error") === "link";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Вход</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Введите почту и пароль.</p>
      </div>
      <Card>
        <CardContent>
          {linkError && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {LINK_ERROR_MESSAGE}
            </p>
          )}
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
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Входим..." : "Войти"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/signup" className="font-medium text-foreground underline-offset-2 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
