# Когда выйти?

Веб-табло, которое хранит твои маршруты и расписание (пары, тренировки, что угодно)
и на главном экране сразу показывает, во сколько по каждому пункту нужно выйти
из дома, чтобы успеть — с учётом времени в пути и запаса на форс-мажоры.

```
выйти = время начала − запас на «ой, ключи забыл» − время в пути
```

## Стек

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (`@base-ui/react`) ·
Supabase (Postgres + Auth) · pnpm

## Запуск

```bash
pnpm install
pnpm dev       # http://localhost:3000
```

Продакшен-сборка:

```bash
pnpm build
pnpm start
```

Проверки:

```bash
pnpm lint
pnpm exec tsc --noEmit
```

## Supabase

Все данные (маршруты, настройки) и авторизация — в Supabase. Без переменных
окружения ниже серверный и браузерный клиенты Supabase упадут с ошибкой на
каждом запросе.

### Переменные окружения

```bash
cp .env.example .env.local
```

Впишите значения из **Project Settings → API** вашего проекта в Supabase Dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### Схема БД

Миграция — `supabase/migrations/20260923120000_routes_and_settings.sql`, применяется
через Supabase MCP (`mcp__supabase__apply_migration`) или Supabase CLI. Создаёт две
таблицы с RLS-политиками по `auth.uid() = user_id`, так что каждый пользователь
видит и меняет только свои строки:

- **`routes`** — `name`, `travel_minutes`, `buffer_minutes` (необязательный, иначе
  берётся значение по умолчанию), `schedule` (`jsonb`-массив `{ weekday, time }`).
- **`settings`** — одна строка на пользователя, `default_buffer_minutes`.

### Вход: почта и пароль

Регистрация, вход и сброс пароля — без magic-links, только `email` + `password`.

- `/login` — вход (`signInWithPassword`).
- `/signup` — регистрация (`signUp`). Если в проекте включено подтверждение почты
  (**Authentication → Providers → Email → Confirm email**, включено по умолчанию на
  hosted-проектах), после регистрации приходит письмо со ссылкой подтверждения и
  сессия появляется только после перехода по ней; если подтверждение выключено,
  `signUp` сразу возвращает сессию.
- `/forgot-password` — запрос ссылки для сброса пароля (`resetPasswordForEmail`).
- `/auth/update-password` — задание нового пароля (`updateUser({ password })`); на
  неё ведёт ссылка из письма сброса.
- `app/auth/confirm/page.tsx` — общая страница подтверждения ссылок из писем
  (регистрация и сброс пароля). Верификация происходит **только по клику на
  кнопку**, а не сразу при открытии страницы: почтовые клиенты (замечено на
  `@yandex.ru`) сканируют ссылки на вирусы, открывая их раньше пользователя, и если
  бы проверка запускалась на `GET`/при загрузке страницы, такой сканер сжигал бы
  одноразовый токен раньше человека — ссылка выглядела бы «недействительной» ещё до
  первого реального клика (см.
  [Supabase: Email prefetching](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching)).
  Страница поддерживает оба формата ссылки:
  - `?code=...` (PKCE) — ссылка по умолчанию из шаблонов Supabase, идёт через
    служебный `.../auth/v1/verify` и работает **из коробки**, но только в том
    браузере, где её запросили (PKCE-verifier лежит в cookie этого браузера).
  - `?token_hash=...&type=...&next=...` — работает при открытии на **другом
    устройстве**, но требует правки шаблона письма (см. ниже). `next` — путь, куда
    редиректить после успешной проверки (`/` по умолчанию, `/auth/update-password`
    для сброса пароля).

Если нужна работа ссылок на другом устройстве, замените в **Authentication → Email
Templates**:

- **Confirm signup**:
  ```
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
  ```
- **Reset Password**:
  ```
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password
  ```

Обязательно в любом случае: **Authentication → URL Configuration → Redirect URLs**
должен содержать адрес приложения (`http://localhost:3000` для разработки, домен
на Vercel — для продакшена), иначе Supabase откажется редиректить на `/auth/confirm`.

Также учитывайте лимит бесплатной отправки писем Supabase (несколько писем в час) —
при `429 email rate limit exceeded` письмо не отправляется, нужно подождать.

## Структура

```
app/
  welcome/page.tsx        публичный лендинг для гостей
  login/, signup/         вход и регистрация
  forgot-password/        запрос сброса пароля
  auth/confirm/           обработка ссылок из писем
  auth/update-password/   форма нового пароля
  auth/actions.ts         серверный экшен signOut()
  page.tsx                главный экран — табло с маршрутами (требует входа)
  layout.tsx              шрифты, метаданные
proxy.ts                  middleware: гейтит доступ по сессии Supabase
components/
  route-editor.tsx        форма создания/редактирования маршрута
  saved-routes.tsx        список маршрутов + расчётное табло
  auth-shell.tsx          общий каркас для login/signup
  board-styles.ts         общие классы кнопок, полей, карточек
  ui/                     примитивы shadcn (button, input, select, card...)
lib/
  types.ts                Weekday, ScheduleEntry, SavedRoute
  calculate-departure.ts  чистая логика расчёта времени выхода
  routes-storage.ts       CRUD маршрутов поверх Supabase (хук useRoutes)
  settings-storage.ts     запас по умолчанию (хук useSettings)
  supabase/               обёртки над @supabase/ssr (client и server)
  use-now.ts              тикающие текущие часы
supabase/migrations/      SQL-схема таблиц routes и settings
```
