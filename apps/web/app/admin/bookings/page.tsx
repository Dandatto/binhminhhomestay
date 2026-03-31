"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/components/AdminContext";
import type { BookingRecord } from "@/lib/domain";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminBookingsPage() {
  const { token } = useAdmin();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bookings?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const updateStatus = async (id: string, status: BookingRecord["status"]) => {
    setProcessingId(id);
    const loadingToast = toast.loading(`Đang cập nhật trạng thái...`);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, status })
      });
      
      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success(`Đã cập nhật thành ${status}`);
        await fetchBookings();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Lỗi cập nhật booking");
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Khởi chạy thất bại do kết nối mạng");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold inline-block">Chờ xử lý</span>;
      case "CONFIRMED":
        return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold inline-block">Đã chốt phòng</span>;
      case "CANCELLED":
        return <span className="bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold inline-block">Đã hủy</span>;
      case "FAILED":
        return <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold inline-block">Lỗi</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold inline-block">{status}</span>;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-soft border border-sky-blue/10">
        <div>
          <h1 className="text-3xl font-black text-ocean-blue">Quản lý Đặt phòng</h1>
          <p className="text-ocean-blue/60 mt-2 font-medium">Theo dõi, duyệt hoặc từ chối các phiên đặt phòng mới. Hệ thống sẽ tự gửi Email khi bạn Duyệt đơn.</p>
        </div>
        <button onClick={fetchBookings} className="text-sm font-bold text-ocean-blue bg-sand-white px-4 py-2 rounded-xl hover:bg-sky-blue/10 transition-colors">
          Làm mới 🔄
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-sky-blue/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ocean-blue/5 text-ocean-blue font-bold tracking-wider uppercase text-xs">
            <tr>
              <th className="px-6 py-5">Mã Booking</th>
              <th className="px-6 py-5">Khách hàng</th>
              <th className="px-6 py-5">SĐT</th>
              <th className="px-6 py-5">Nhận / Trả</th>
              <th className="px-6 py-5">Hạng phòng</th>
              <th className="px-6 py-5">Trạng thái</th>
              <th className="px-6 py-5">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-ocean-blue/80 font-medium">
            {loading && bookings.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean-blue/50" /></td></tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 opacity-50 font-bold">Chưa có Booking nào được ghi nhận</td></tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-sky-blue/5 hover:bg-sky-blue/5 transition-all">
                <td className="px-6 py-4 font-mono font-black text-ocean-blue text-xs">{b.bookingCode}</td>
                <td className="px-6 py-4 font-bold">{b.guestName}</td>
                <td className="px-6 py-4">{b.phone}</td>
                <td className="px-6 py-4 font-mono text-xs text-ocean-blue/70">
                  {new Date(b.checkInDate).toLocaleDateString('vi-VN')} <br/>
                  <span className="text-ocean-blue/30 inline-block rotate-90 my-1">→</span> <br/>
                  {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">{b.roomType}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(b.status)}
                </td>
                <td className="px-6 py-4">
                  {b.status === "PENDING_CONFIRMATION" ? (
                    <div className="flex flex-col gap-2 min-w-[100px]">
                      <button 
                        disabled={processingId === b.id}
                        onClick={() => updateStatus(b.id, "CONFIRMED")} 
                        className="bg-ocean-blue text-white px-3 py-2 rounded-xl font-bold hover:shadow-md transition-all w-full text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {processingId === b.id ? <Loader2 className="w-3 h-3 animate-spin"/> : null}
                        Duyệt
                      </button>
                      <button 
                        disabled={processingId === b.id}
                        onClick={() => updateStatus(b.id, "CANCELLED")} 
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-xl font-bold hover:bg-red-100 transition-all w-full text-xs disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-ocean-blue/30 italic">Đã xử lý</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
