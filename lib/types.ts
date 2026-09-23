// Общие типы доменной модели приложения.

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Пн",
  tue: "Вт",
  wed: "Ср",
  thu: "Чт",
  fri: "Пт",
  sat: "Сб",
  sun: "Вс",
};

/** Одна пара: день недели + время начала "HH:mm". */
export interface ScheduleEntry {
  weekday: Weekday;
  time: string;
}

/** Сохранённый маршрут-корпус (хранится в localStorage). */
export interface SavedRoute {
  id: string;
  name: string;
  /** Время в пути до корпуса в минутах — вводится вручную. */
  travelMinutes: number;
  /** Если не задано — используется глобальный запас по умолчанию. */
  bufferMinutes?: number;
  /** Все пары недели для этого маршрута. */
  schedule: ScheduleEntry[];
}
