import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agenda — Agendamentos Online",
  description:
    "Sistema de agendamento online para pequenas empresas. Fácil, rápido e gratuito.",
  keywords: ["agendamento", "agenda online", "pequenas empresas", "booking"],
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#ff8c42",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-orange-50 text-gray-800 antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#ff8c42",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: "500",
              },
              success: {
                iconTheme: { primary: "#fff", secondary: "#ff8c42" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
