"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sunrise, Menu } from "lucide-react";

export default function Navbar() {
  const hotline = "0965312678";
  return (
    <nav className="hidden md:flex fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-7xl glass rounded-2xl px-6 py-4 items-center justify-between shadow-soft">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-sunrise-yellow p-1.5 rounded-lg transition-transform group-hover:scale-110">
          <Sunrise className="w-5 h-5 text-ocean-blue" />
        </div>
        <span className="font-bold text-lg text-ocean-blue tracking-tight">
          Binh Minh <span className="font-normal opacity-70 italic">2026</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <NavLink href="/experience">Trải nghiệm</NavLink>
        <NavLink href="/rooms">Phòng nghỉ</NavLink>
        <NavLink href="/dining">Ẩm thực</NavLink>
        <NavLink href="/news">Tin tức</NavLink>
        <NavLink href="/faq">Hỏi đáp</NavLink>
      </div>

      <div className="flex items-center gap-4">
        <a href={`tel:${hotline}`} className="hidden lg:block text-sm font-bold text-ocean-blue/60 hover:text-ocean-blue">
          Hotline: {hotline}
        </a>
        <Link 
          href="/booking"
          className="bg-ocean-blue text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-ocean-blue/90 transition-all shadow-md active:scale-95"
        >
          Đặt chỗ
        </Link>
        <button className="hidden p-2 text-ocean-blue">
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-ocean-blue/70 font-medium hover:text-ocean-blue transition-colors relative group"
    >
      {children}
      <motion.div 
        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sunrise-yellow" 
        whileHover={{ width: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </Link>
  );
}
