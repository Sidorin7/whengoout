"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth-shell";
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
    <AuthShell
      kicker="с возвращением"
      title="Снова"
      accent="привет."
      subtitle="Опоздания сами себя не отменят. Заходи — посчитаем, когда тебе выходить."
      board={[
        { time: "08:03", what: "«Я уже на остановке»", status: "ЛОЖЬ" },
        { time: "08:12", what: "Выйти по нашему табло", status: "ПО ПЛАНУ", good: true },
      ]}
    >
      <h2 className="font-heading text-2xl font-bold tracking-tight">Вход</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Почта и пароль — и погнали.</p>
      {linkError && (
        <p className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {LINK_ERROR_MESSAGE}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ty@pochta.ru"
            className={authInputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
            >
              Забыл? Бывает.
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={authInputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
        <button type="submit" disabled={status === "sending"} className={authButtonClass}>
          {status === "sending" ? "Входим..." : "Войти"}
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ещё нет аккаунта?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-2 hover:underline">
          Хочу перестать опаздывать
        </Link>
      </p>
    </AuthShell>
  );
}
