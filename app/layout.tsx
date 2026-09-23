import type { Metadata } from "next";
import { Unbounded, Golos_Text, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
  weight: ["600", "700"],
});

const golos = Golos_Text({
  variable: "--font-body",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-time",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Когда выйти?",
  description:
    "Табло с временем выхода: сохраните маршруты и время пар — остальное посчитается само.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${golos.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
