"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { inputClass, primaryButtonClass } from "@/components/board-styles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 6;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus("error");
      setErrorMessage(`Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов.`);
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Пароли не совпадают.");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      // Email confirmations are disabled on this project — signUp already returned a session.
      router.replace("/");
      router.refresh();
      return;
    }

    setStatus("sent");
  }

  return (
    <AuthShell
      kicker="новая жизнь начинается тут"
      title="Последний раз"
      accent="опоздал."
      subtitle="Регистрация — 20 секунд. Это быстрее, чем найти второй носок."
      board={[
        { time: "07:55", what: "Ещё 5 минуточек", status: "×6" },
        { time: "08:31", what: "Бег с бутербродом", status: "ОПОЗДАНИЕ" },
        { time: "08:12", what: "Выйти вовремя (с нами)", status: "ПО ПЛАНУ", good: true },
      ]}
    >
      {status === "sent" ? (
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">Чекни почту</h2>
          <p className="mt-3 text-muted-foreground">
            Мы отправили ссылку на <span className="font-semibold text-foreground">{email}</span>.
            Жми по ней, чтобы подтвердить регистрацию. Нет письма — загляни в «Спам», оно
            стесняется.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-heading text-2xl font-bold tracking-tight">Регистрация</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Почта, пароль — и ты в игре.</p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ty@pochta.ru"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                placeholder={`от ${MIN_PASSWORD_LENGTH} символов, не «123456»`}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Ещё разок пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
            <button type="submit" disabled={status === "sending"} className={primaryButtonClass}>
              {status === "sending" ? "Регистрируем..." : "Я хочу перестать опаздывать"}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Уже с нами?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-2 hover:underline">
          Войти
        </Link>
      </p>
    </AuthShell>
  );
}
