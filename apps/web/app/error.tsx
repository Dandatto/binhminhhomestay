"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { DandattoHover } from "@/components/MicroInteractions";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Next.js Error Boundary]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-sand-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-lg bg-white p-10 rounded-[40px] shadow-soft border border-ocean-blue/5"
      >
        <div className="flex justify-center text-red-500 mb-4">
          <AlertTriangle className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-black text-ocean-blue tracking-tight">Sóng to gió lớn!</h1>
        <p className="text-ocean-blue/60 text-lg">
          Đã có lỗi hệ thống xảy ra khi tải trang: <strong>{error.message || "Unknown Error"}</strong>
        </p>
        
        <div className="pt-6">
          <DandattoHover className="inline-block w-full">
            <button
              onClick={() => reset()}
              className="bg-ocean-blue text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all w-full"
            >
              THỬ LẠI LẦN NỮA
            </button>
          </DandattoHover>
        </div>
      </motion.div>
    </main>
  );
}
