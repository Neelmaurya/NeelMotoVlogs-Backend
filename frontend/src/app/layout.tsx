import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Neel MotoVlogs | Travel Creator Platform",
  description: "A premium travel creator platform for bloggers and vloggers.",
  keywords: ["travel", "vlog", "blog", "moto vlogs", "neel moto vlogs", "adventures"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-zinc-950 text-zinc-100 min-h-full flex flex-col`}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
