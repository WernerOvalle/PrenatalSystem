import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Control Prenatal",
  description: "Registro y control prenatal de gestantes",
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
