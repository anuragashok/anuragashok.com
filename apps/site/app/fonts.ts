import { IBM_Plex_Mono, Instrument_Serif, Inter } from "next/font/google";

// Inter is variable — one file covers every weight, no `weight` key.
export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

// Instrument Serif is NOT variable — `weight` is required. Display face, 400, upright only.
// The italic face is deliberately NOT loaded: nothing on the site paints it. The one `<em>`
// in a serif context (the home headline's accent word) is explicitly `not-italic`, and prose
// italics render in Inter. Loading it cost 14.7 KB of a 77.3 KB font budget — 19% — preloaded
// on every cold start and never once drawn. If a serif italic is ever actually wanted, add
// `style: ["normal", "italic"]` back and make sure something renders it.
export const serif = Instrument_Serif({
  weight: "400",
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
