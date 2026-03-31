"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, MessageSquareText, ShieldCheck } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  // Ẩn MobileNav nếu đang ở trong khu vực Admin
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-sky-blue/20 shadow-[0_-10px_40px_-15px_rgba(0,51,102,0.1)] z-50 pb-safe">
      <div className="flex items-center justify-around p-2">
        <NavItem href="/" icon={<Home strokeWidth={1.5} />} label="Trang chủ" active={pathname === "/"} />
        <NavItem href="/booking" icon={<CalendarCheck strokeWidth={1.5} />} label="Đặt phòng" active={pathname === "/booking"} />
        <NavItem href="/faq" icon={<MessageSquareText strokeWidth={1.5} />} label="Hỏi Long Xì" active={pathname === "/faq"} />
        <NavItem href="/admin" icon={<ShieldCheck strokeWidth={1.5} />} label="Nội bộ" active={pathname === "/admin"} />
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-full p-2 space-y-1 transition-all ${active ? "text-ocean-blue" : "text-ocean-blue/40"}`}
    >
      <div className={`transition-transform duration-300 ${active ? "scale-110" : ""}`}>
        {icon}
      </div>
      <span className={`text-[10px] uppercase tracking-wider font-sans ${active ? "font-bold" : "font-medium"}`}>
        {label}
      </span>
      {active && (
        <div className="absolute top-1 w-1 h-1 bg-sunrise-yellow rounded-full" />
      )}
    </Link>
  );
}
