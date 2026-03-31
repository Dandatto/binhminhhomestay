import { AdminProvider } from "@/components/AdminContext";
import Link from "next/link";
import { Ship, Calendar, Settings, Activity, Image as ImageIcon, FileText } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-sand-white pt-[60px]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-sky-blue/20 flex flex-col pt-8 text-ocean-blue">
           <div className="px-6 mb-8">
             <h2 className="text-xl font-black tracking-tight">Căn Cứ Điều Hành</h2>
             <p className="text-xs opacity-50 font-medium tracking-wider">BINHMINH HOMESTAY CMS</p>
           </div>
           
           <nav className="flex-1 px-4 space-y-2">
             <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-blue/5 font-bold transition-colors">
               <Activity className="w-5 h-5 text-sunrise-yellow"/> Giám sát (Monitor)
             </Link>
             <Link href="/admin/bookings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-blue/5 font-bold transition-colors">
               <Calendar className="w-5 h-5 text-blue-500"/> Duyệt Đặt phòng
             </Link>
             <Link href="/admin/vessels" className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-blue/5 font-bold transition-colors">
               <Ship className="w-5 h-5 text-teal-500"/> Lịch tàu chạy
             </Link>
             <Link href="/admin/pricing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-blue/5 font-bold transition-colors">
               <Settings className="w-5 h-5 text-purple-500"/> Giá & Doanh thu
             </Link>
             <Link href="/admin/photos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-blue/5 font-bold transition-colors">
               <ImageIcon className="w-5 h-5 text-indigo-500"/> Thư viện ảnh
             </Link>
             <Link href="/admin/articles" className="flex items-center gap-3 p-3 rounded-xl hover:bg-ocean-blue/5 font-bold transition-colors">
               <FileText className="w-5 h-5 text-orange-500"/> Tin tức & Bài viết
             </Link>
           </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 h-[calc(100vh-60px)] overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}
