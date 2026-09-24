import Link from "next/link";
import type { ReactNode } from "react";
import { cardClass } from "@/components/board-styles";

type BoardRow = { time: string; what: string; status: string; good?: boolean };

export function AuthShell({
  kicker,
  title,
  accent,
  subtitle,
  board,
  children,
}: {
  kicker: string;
  title: string;
  accent: string;
  subtitle: ReactNode;
  board: BoardRow[];
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/welcome" className="font-heading text-base font-bold tracking-tight sm:text-lg">
          когда<span className="text-primary">выйти?</span>
        </Link>
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl flex-1 content-start items-center gap-10 px-4 pt-6 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:content-center lg:gap-16 lg:pt-0">
        <section>
          <p className="flex items-center gap-3 font-mono text-xs tracking-widest text-primary uppercase sm:text-sm">
            <span aria-hidden className="h-0.5 w-8 bg-primary" />
            {kicker}
          </p>
          <h1 className="mt-5 font-heading text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance">
            {title} <span className="text-primary">{accent}</span>
          </h1>
          <p className="mt-5 max-w-[34ch] text-lg text-muted-foreground sm:text-xl">{subtitle}</p>

          <ul className="mt-8 hidden max-w-md overflow-hidden rounded-lg border-[1.5px] border-foreground bg-card lg:block">
            {board.map((row) => (
              <li
                key={row.what}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border/60 px-4 py-3 last:border-b-0"
              >
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-lg font-semibold tabular-nums ${
                    row.good ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {row.time}
                </span>
                <span className={row.good ? "font-semibold" : "text-muted-foreground"}>
                  {row.what}
                </span>
                <span
                  className={`font-mono text-xs font-semibold tracking-wider ${
                    row.good ? "text-primary" : "text-destructive"
                  }`}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass + " w-full p-6 sm:p-8"}>
          {children}
        </section>
      </main>
    </div>
  );
}
