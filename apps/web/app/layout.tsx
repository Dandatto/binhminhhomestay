import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_SC } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { MobileNav } from "@/components/MobileNav";
import { LongXiFAB } from "@/components/LongXiFAB";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
});

const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sc",
});

export const metadata: Metadata = {
  title: "Binh Minh Homestay",
  description: "Binh Minh Homestay - Cứ để đất liền đợi chúng ta...",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${playfair.variable} ${inter.variable} ${notoSC.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="font-heading antialiased h-[100dvh] overflow-hidden" suppressHydrationWarning>
        <ThemeProvider>
          {/* Full-width frame — hero fills entire viewport, no dark sidebars */}
          <div className="relative w-full h-full flex flex-col bg-bg-primary text-text-primary transition-colors duration-1000 overflow-hidden pt-safe-top">
            <main id="main-scroll" className="flex-1 w-full h-full relative overflow-y-auto overflow-x-hidden">
              {children}
            </main>

            {/* M3E Navigation Bar — persistent, always visible, 5 tabs */}
            <MobileNav />

            {/* Brand credit — floats below nav pill, above safe-area */}
            <p className="absolute bottom-1 left-0 right-0 text-center
                          text-[0.6rem] font-sans text-text-secondary/35 tracking-tight
                          pointer-events-none pb-safe-bottom">
              Website được tạo bởi Vân Đồn Solutions ©
            </p>

            {/* LongXiFAB — MVP: tạm ẩn, tránh che nội dung. Sẽ phát triển lại sau Sprint 2 */}
            {/* <LongXiFAB /> */}
            <Toaster position="top-center" richColors />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
