"use client";

import { useState } from "react";
import { RouteEditor } from "@/components/route-editor";
import { SavedRoutes } from "@/components/saved-routes";
import { SignOutButton } from "@/components/sign-out-button";
import { useRoutes } from "@/lib/routes-storage";
import { useSettings } from "@/lib/settings-storage";
import type { SavedRoute } from "@/lib/types";

type View = { name: "list" } | { name: "edit"; route?: SavedRoute };

export default function Home() {
  const { routes, loading: routesLoading, error: routesError, upsertRoute, deleteRoute } = useRoutes();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    setDefaultBufferMinutes,
  } = useSettings();
  const loading = routesLoading || settingsLoading;
  const error = routesError ?? settingsError;
  // null = пользователь ещё не выбирал экран явно — берём разумное значение по умолчанию из routes.
  const [explicitView, setView] = useState<View | null>(null);
  // Маршрутов не осталось (включая случай "удалили последний") — всегда редактор,
  // даже если до этого явно был выбран список.
  const view: View = routes.length === 0 ? { name: "edit" } : (explicitView ?? { name: "list" });

  async function handleSaved(route: SavedRoute) {
    const ok = await upsertRoute(route);
    if (ok) setView({ name: "list" });
  }

  async function handleDelete(route: SavedRoute) {
    if (!window.confirm(`Удалить маршрут «${route.name}»?`)) return;
    await deleteRoute(route.id);
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
          <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-primary" />
          Загружаем табло...
        </p>
      </main>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <header className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-8">
        <span className="font-heading text-base font-bold tracking-tight sm:text-lg">
          когда<span className="text-primary">выйти?</span>
        </span>
        <SignOutButton />
      </header>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pt-4 pb-16 sm:px-8 sm:pt-8">
        <section>
          <p className="inline-flex -rotate-1 items-center gap-2 rounded-full bg-secondary px-4 py-1.5 font-mono text-xs tracking-wide text-muted-foreground uppercase sm:text-sm">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            {view.name === "list" ? "табло отправлений" : "диспетчерская"}
          </p>
          <h1 className="mt-4 font-heading text-[clamp(2.25rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance">
            {view.name === "list" ? (
              <>
                Когда <span className="text-primary">выходим?</span>
              </>
            ) : (
              <>
                {view.route ? "Правим" : "Новый"}{" "}
                <span className="text-primary">маршрут.</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-[40ch] text-muted-foreground sm:text-lg">
            {view.name === "list"
              ? "Сохранил маршрут и время пар — табло само скажет, когда отлипать от кровати."
              : "Сколько едешь, во сколько надо быть. Остальное — наша забота."}
          </p>
        </section>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {view.name === "list" ? (
          <SavedRoutes
            routes={routes}
            settings={settings}
            onSettingsChange={setDefaultBufferMinutes}
            onEdit={(route) => setView({ name: "edit", route })}
            onDelete={handleDelete}
            onAdd={() => setView({ name: "edit" })}
          />
        ) : (
          <RouteEditor
            initialRoute={view.route}
            defaultBufferMinutes={settings.defaultBufferMinutes}
            onSaved={handleSaved}
            onCancel={routes.length > 0 ? () => setView({ name: "list" }) : undefined}
          />
        )}
      </main>
    </div>
  );
}
