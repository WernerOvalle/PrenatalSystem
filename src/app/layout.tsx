import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Sistema de Citas · Centro de salud Bárbara",
  description:
    "Agendamiento de citas de consulta general, pediatría y prenatal con confirmación telefónica",
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
      <body className="min-h-full">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
