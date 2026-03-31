import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./styles.css";
import FloatingStatus from "@/components/FloatingStatus";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav"; // Will create this next

const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Binh Minh Homestay 2026",
  description: "The Sunrise Hub - Đón bình minh sớm nhất trên đảo Minh Châu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen font-serif bg-sand-white pb-20 md:pb-0">
        <FloatingStatus />
        <Navbar />
        {children}
        <MobileNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

