"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <>
      {/* Mobile-first Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 bg-surface/70 backdrop-blur-xl rounded-full mt-2 mx-4 px-4 w-[calc(100%-2rem)] shadow-xl shadow-on-surface/5">
        <div className="flex items-center gap-3">
          <button className="material-symbols-outlined text-primary p-1 hover:bg-white/20 rounded-full transition-all active:scale-90 flex items-center justify-center w-10 h-10">
            menu
          </button>
          <Link href="/" className="font-headline text-2xl font-black text-primary drop-shadow-sm">
            Binh Minh
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-primary-container/10 bg-white/50 flex items-center justify-center hover:bg-white transition-colors active:scale-90">
            <span className="material-symbols-outlined text-primary">language</span>
          </button>
        </div>
      </header>
      
      {/* Spacer to push content down so it doesn't hide behind the floating header */}
      <div className="h-20 w-full md:hidden"></div>
    </>
  );
}
