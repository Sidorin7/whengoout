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
  const { routes, loading, upsertRoute, deleteRoute } = useRoutes();
  const { settings, setDefaultBufferMinutes } = useSettings();
  // null = пользователь ещё не выбирал экран явно — берём разумное значение по умолчанию из routes.
  const [explicitView, setView] = useState<View | null>(null);
  const view = explicitView ?? (routes.length === 0 ? { name: "edit" } : { name: "list" });

  async function handleSaved(route: SavedRoute) {
    await upsertRoute(route);
    setView({ name: "list" });
  }

  async function handleDelete(route: SavedRoute) {
    if (!window.confirm(`Удалить маршрут «${route.name}»?`)) return;
    await deleteRoute(route.id);
  }

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-8">
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Когда выйти</h1>
          <p className="mt-1.5 max-w-[42ch] text-sm text-muted-foreground">
            Сохраните маршруты и время пар — доска сама посчитает, во сколько выходить.
          </p>
        </div>
        <SignOutButton />
      </div>

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
  );
}
