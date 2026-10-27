import { Public_Sans, Source_Serif_4 } from "next/font/google";

export const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const fontVariables = `${serif.variable} ${sans.variable}`;
