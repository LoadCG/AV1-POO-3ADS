import type { Metadata } from "next";
import { Inter, Jockey_One } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jockeyOne = Jockey_One({
  weight: "400",
  variable: "--font-jockey-one",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyForge — Sistema de Gestão de Aeronaves",
  description: "Sistema de gestão de produção de aeronaves. Controle de peças, etapas, testes e relatórios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${jockeyOne.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-950 text-slate-200">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#34d399", secondary: "#1e293b" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#1e293b" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
