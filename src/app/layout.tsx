// src/app/layout.tsx — Root layout con metadata global + SEO
// confidence: high
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ChatBot } from "@/components/ui/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sushi-bar.ar"),
  title: {
    default: "🍣 Sushi Bar — Sushi Fresco, Pedidos Online y Reservas",
    template: `%s | Sushi Bar`,
  },
  description:
    "Auténtico sushi fresco hecho al momento. Pedidos online con delivery o reservá tu mesa. Menú: rolls, nigiris, sashimi, combos. Promociones semanales.",
  keywords: [
    "sushi",
    "sushi bar",
    "pedir sushi",
    "delivery sushi",
    "reservar mesa",
    "rolls",
    "nigiri",
    "sashimi",
    "menú sushi",
    "promociones sushi",
    "sushi [ciudad]",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://sushi-bar.ar",
    siteName: "Sushi Bar",
    title: "🍣 Sushi Bar — Sushi Fresco, Pedidos Online y Reservas",
    description:
      "Auténtico sushi fresco hecho al momento. Pedidos online con delivery o reservá tu mesa.",
    images: [
      {
        url: "/images/sushi-og-placeholder.svg",

        width: 1200,
        height: 630,
        alt: "Sushi Bar — rolls, nigiris y sashimi frescos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🍣 Sushi Bar — Pedidos Online y Reservas",
    description:
      "Auténtico sushi fresco. Pedidos online, delivery, reservas de mesa.",
    images: ["/images/sushi-og-placeholder.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-AR": "/es",
      "en-US": "/en",
    },
  },
  category: "Food",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <div id="theme-transition" className="fixed inset-0 pointer-events-none z-[100] opacity-0 transition-opacity duration-300" />
          <a href="#main-content" id="skip-to-content">
            Saltar al contenido
          </a>
          {children}
          <ThemeToggle />
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  );
}
