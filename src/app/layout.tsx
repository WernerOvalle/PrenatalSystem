import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "MediAgenda Demo · Sistema de citas",
  description:
    "Demo de agendamiento de citas de consulta general, pediatría, prenatal y oftalmología con confirmación telefónica. Todos los datos son ficticios.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <DemoBanner />
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
