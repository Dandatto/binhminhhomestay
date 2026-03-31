"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DandattoHover } from "@/components/MicroInteractions";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-sand-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-md"
      >
        <div className="text-8xl mb-4">🏝️</div>
        <h1 className="text-5xl font-black text-ocean-blue tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-ocean-blue">Lạc mất bến thuyền!</h2>
        <p className="text-ocean-blue/60 text-lg">
          Có vẻ như trang bạn đang tìm kiếm đã trôi dạt ra khơi xa hoặc chưa từng tồn tại trên bản đồ Minh Châu.
        </p>
        
        <div className="pt-8">
          <DandattoHover className="inline-block w-full">
            <Link
              href="/"
              className="bg-sunrise-yellow text-ocean-blue px-8 py-4 rounded-2xl font-black text-xl hover:shadow-lg transition-all inline-block w-full"
            >
              VỀ LẠI TRẠM BÌNH MINH
            </Link>
          </DandattoHover>
        </div>
      </motion.div>
    </main>
  );
}
