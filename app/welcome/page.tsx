import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, MapPin, Timer } from "lucide-react";

export const metadata: Metadata = {
  title: "Когда выйти? — перестань опаздывать",
  description:
    "Скажи, куда и во сколько тебе надо — мы скажем, когда отлипнуть от кровати. Без нотаций, честно.",
};

const EXCUSES = [
  "автобус уехал прямо перед носом",
  "лифт застрял (на 7 минут в тиктоке)",
  "кот лёг на кроссовки",
  "я думал, что уже пятница",
  "будильник не той громкости",
  "маршрутка свернула не туда",
  "искал второй носок",
  "телефон сел на 1%",
];

const BOARD = [
  { time: "07:40", what: "Проснуться по будильнику", status: "ОТМЕНЕНО", tone: "bad" },
  { time: "07:55", what: "Ещё 5 минуточек", status: "×6", tone: "bad" },
  { time: "08:31", what: "Выбежать с бутербродом в зубах", status: "ОПОЗДАНИЕ", tone: "bad" },
  { time: "08:12", what: "Выйти вовремя (с нами)", status: "ПО ПЛАНУ", tone: "good" },
] as const;

const STEPS = [
  {
    icon: MapPin,
    title: "Кидаешь маршрут",
    text: "Откуда и куда. Дом → школа, общага → пары, диван → тренировка.",
  },
  {
    icon: Timer,
    title: "Говоришь, когда надо быть",
    text: "И сколько минут запаса. Мы же знаем, что «я быстро» — это не план.",
  },
  {
    icon: BellRing,
    title: "Получаешь время выхода",
    text: "С пробками и транспортом. Дальше дело за тобой (и за будильником).",
  },
];

export default function WelcomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <span className="font-heading text-base font-bold tracking-tight sm:text-lg">
          когда<span className="text-primary">выйти?</span>
        </span>
        <Link
          href="/login"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          Войти
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
          <p className="inline-flex -rotate-1 items-center gap-2 rounded-full bg-secondary px-4 py-1.5 font-mono text-xs tracking-wide text-muted-foreground uppercase sm:text-sm">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            для тех, кто «уже выхожу» (нет)
          </p>

          <h1 className="mt-6 font-heading text-[clamp(2.5rem,10vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.04em] text-balance">
            Хватит <br className="hidden sm:block" />
            <span className="relative inline-block text-primary">
              опаздывать
              <svg
                aria-hidden
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-[calc(100%-0.35em)] text-primary/60 sm:-bottom-4 sm:h-5"
              >
                <path
                  d="M2 14 C 60 2, 120 20, 180 8 S 280 4, 298 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-foreground">.</span>
            </span>
          </h1>

          <p className="mt-8 max-w-[36ch] text-lg text-muted-foreground sm:text-2xl">
            Скажи, куда и во сколько тебе надо — мы скажем, когда отлипнуть от кровати.
            <span className="text-foreground"> Без нотаций. Честно.</span>
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_0_0_0_var(--primary)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-8px_var(--primary)] sm:h-16 sm:px-9 sm:text-lg"
            >
              Я хочу перестать опаздывать
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full border border-border px-7 text-base font-medium transition-colors hover:border-foreground sm:h-16 sm:text-lg"
            >
              Я уже в теме — войти
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Бесплатно. Регистрация — 20 секунд, это быстрее, чем ты обычно собираешься.
          </p>
        </section>

        <div className="-rotate-2 border-y border-border bg-primary py-3 text-primary-foreground">
          <div className="flex w-max animate-[marquee_40s_linear_infinite] motion-reduce:animate-none">
            {[...EXCUSES, ...EXCUSES].map((excuse, i) => (
              <span
                key={i}
                className="flex items-center gap-8 pr-8 font-heading text-lg font-bold whitespace-nowrap uppercase sm:text-2xl"
              >
                <span className="line-through decoration-2">{excuse}</span>
                <span aria-hidden>✦</span>
              </span>
            ))}
          </div>
        </div>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <h2 className="font-heading text-[clamp(2rem,6vw,4.5rem)] leading-none font-bold tracking-[-0.03em]">
            Твоё утро сейчас:
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Табло отправлений. Угадай, какой рейс наш.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
              <span>отправление</span>
              <span className="hidden sm:inline">куда</span>
              <span>статус</span>
            </div>
            <ul>
              {BOARD.map((row) => (
                <li
                  key={row.what}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border/60 px-5 py-4 last:border-b-0 sm:gap-8 sm:py-5"
                >
                  <span
                    className={`rounded-md px-2 py-1 font-mono text-lg font-semibold tabular-nums sm:text-3xl ${
                      row.tone === "good" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    {row.time}
                  </span>
                  <span
                    className={`text-sm sm:text-xl ${
                      row.tone === "good" ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {row.what}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold tracking-wider sm:text-sm ${
                      row.tone === "good" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8 sm:pb-28">
          <h2 className="font-heading text-[clamp(2rem,6vw,4.5rem)] leading-none font-bold tracking-[-0.03em]">
            Как это работает
            <span className="text-primary">?</span>
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Три шага. Даже с утра справишься.
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/60 sm:p-8"
              >
                <span className="font-heading text-6xl font-bold text-secondary transition-colors group-hover:text-primary/30 sm:text-7xl">
                  0{i + 1}
                </span>
                <step.icon className="mt-6 size-7 text-primary" />
                <h3 className="mt-4 font-heading text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-14 sm:py-20">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-10 font-heading text-[10rem] leading-none font-bold opacity-10 select-none sm:text-[16rem]"
            >
              08:12
            </span>
            <h2 className="relative max-w-[14ch] font-heading text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.04em]">
              Мама будет в шоке.
            </h2>
            <p className="relative mt-5 max-w-[40ch] text-lg opacity-80 sm:text-xl">
              Классный руководитель тоже. И тренер. И ты сам, если честно.
            </p>
            <Link
              href="/signup"
              className="group relative mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-background px-8 text-base font-semibold text-foreground transition-transform hover:-translate-y-0.5 sm:h-16 sm:text-lg"
            >
              Попробовать
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-sm text-muted-foreground sm:px-8">
        Сделано для тех, кто всегда «уже в пути». Маршруты — 2ГИС.
      </footer>
    </div>
  );
}
