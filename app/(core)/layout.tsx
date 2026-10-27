import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteLoaderProvider } from "@/components/provider/router-loader-provider";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <RouteLoaderProvider>
        <TooltipProvider>
          <body>{children}</body>
          <Toaster />
        </TooltipProvider>
      </RouteLoaderProvider>
    </html>
  );
}
