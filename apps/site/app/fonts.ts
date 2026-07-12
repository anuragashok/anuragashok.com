import { IBM_Plex_Mono, Instrument_Serif, Inter } from "next/font/google";

// Inter is variable — one file covers every weight, no `weight` key.
export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

// Instrument Serif is NOT variable — `weight` is required. Display face; 400 + italic is all we need.
export const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-serif",
});

// IBM Plex Mono is NOT variable — `weight` is required. 400 only: every extra weight is another file,
// and metadata does not need bold. Below the fold on every page, so it does not preload.
export const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});
