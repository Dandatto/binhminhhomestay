import Link from "next/link";
import { Anchor } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-ocean-blue/5 rounded-full flex items-center justify-center mb-6">
        <Anchor className="w-10 h-10 text-ocean-blue opacity-50" />
      </div>
      <h1 className="text-4xl font-black text-ocean-blue font-serif mb-2">404</h1>
      <h2 className="text-xl font-bold text-ocean-blue mb-4 uppercase tracking-widest text-[13px]">Lạc giữa đại dương</h2>
      <p className="text-ocean-blue/60 mb-8 max-w-sm text-sm">
        Trang bạn đang tìm dường như đã trôi dạt đi đâu đó. Hãy quay lại đất liền nhé.
      </p>
      <Link 
        href="/"
        className="bg-ocean-blue text-white px-8 py-4 rounded-full font-bold lowercase shadow-md hover:bg-ocean-blue/90 transition-all active:scale-95 text-sm"
      >
        về đất liền
      </Link>
    </div>
  );
}
