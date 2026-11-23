import { Manrope, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";

// UI/body font.
export const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Display/serif font for hero numbers and page titles (variable opsz axis, no weight array needed).
export const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

// Tabular data font for amounts/dates (non-variable on Google Fonts, so weights must be listed).
export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
