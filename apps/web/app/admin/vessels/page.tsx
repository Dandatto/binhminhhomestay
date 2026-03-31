"use client";

import { useState, useEffect } from "react";
import type { VesselSchedule, AddVesselInput } from "@/lib/domain";
import { useAdmin } from "@/components/AdminContext";

export default function AdminVesselsPage() {
  const { token, logout } = useAdmin();
  const [vessels, setVessels] = useState<VesselSchedule[]>([]);
  const [operator, setOperator] = useState("Havaco");
  const [departure, setDeparture] = useState("07:30");
  const [direction, setDirection] = useState<"inbound" | "outbound" | "both">("inbound");

  const fetchVessels = async () => {
    const res = await fetch("/api/v1/vessels");
    if (res.ok) {
      const data = await res.json();
      setVessels(data.vessels || []);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const addVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AddVesselInput = {
      operator,
      departure,
      direction,
      scheduleDate: new Date().toISOString().slice(0, 10),
    };
    const res = await fetch("/api/admin/vessels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      fetchVessels();
    } else {
      alert("Lỗi: Token sai hoặc mất kết nối.");
    }
  };

  const updateStatus = async (id: string, status: VesselSchedule["status"]) => {
    const res = await fetch("/api/admin/vessels", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      fetchVessels();
    } else {
      alert("Lỗi.");
    }
  };

  const deleteVessel = async (id: string) => {
    const res = await fetch(`/api/admin/vessels?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchVessels();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-ocean-blue">Lịch Tàu Chạy (Hôm nay)</h1>
          <button onClick={logout} className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold">Thoát (Đổi Token)</button>
        </div>

        {/* THÊM MỚI TÀU */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-sky-blue/10">
          <h2 className="text-xl font-bold text-ocean-blue mb-4">Thêm chuyến biểu đồ</h2>
          <form onSubmit={addVessel} className="flex gap-4 flex-wrap">
            <input 
              value={operator} onChange={(e) => setOperator(e.target.value)} 
              placeholder="Nhà xe/tên tàu (Havaco...)" className="border border-sky-blue/30 rounded-xl px-4 py-2" required
            />
            <input 
              type="time" value={departure} onChange={(e) => setDeparture(e.target.value)} 
              className="border border-sky-blue/30 rounded-xl px-4 py-2" required
            />
            <select value={direction} onChange={(e) => setDirection(e.target.value as any)} className="border border-sky-blue/30 rounded-xl px-4 py-2 bg-white">
              <option value="inbound">Vào Đảo 🏝️</option>
              <option value="outbound">Về Đất Liền 🏘️</option>
              <option value="both">Khứ Hồi 🔄</option>
            </select>
            <button type="submit" className="bg-ocean-blue text-white rounded-xl px-6 py-2 hover:bg-ocean-blue/90 font-bold whitespace-nowrap">Cập nhật DB</button>
          </form>
        </div>

        {/* DANH SÁCH TÀU */}
        <div className="bg-white rounded-3xl shadow-soft border border-sky-blue/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-ocean-blue/5 text-ocean-blue">
              <tr>
                <th className="px-6 py-4">Hãng bay</th>
                <th className="px-6 py-4">ETD</th>
                <th className="px-6 py-4">Hướng</th>
                <th className="px-6 py-4">Trạng thái Live</th>
                <th className="px-6 py-4 text-right">#</th>
              </tr>
            </thead>
            <tbody className="text-ocean-blue/80">
              {vessels.map((v) => (
                <tr key={v.id} className="border-t border-sky-blue/10">
                  <td className="px-6 py-4 font-bold">{v.operator}</td>
                  <td className="px-6 py-4">{v.departure}</td>
                  <td className="px-6 py-4">
                    {v.direction === "inbound" && "Vào Đảo 🏝️"}
                    {v.direction === "outbound" && "Về Đất Liền 🏘️"}
                    {v.direction === "both" && "Khứ Hồi 🔄"}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={v.status}
                      onChange={(e) => updateStatus(v.id, e.target.value as any)}
                      className={`font-semibold bg-transparent cursor-pointer outline-none border border-sky-blue/30 px-2 py-1 rounded
                        ${v.status === 'scheduled' ? 'text-gray-500' : ''}
                        ${v.status === 'departed' ? 'text-blue-500' : ''}
                        ${v.status === 'arrived' ? 'text-green-500' : ''}
                        ${v.status === 'cancelled' ? 'text-red-500' : ''}
                      `}
                    >
                      <option value="scheduled" className="text-gray-500">Đang đợi (Scheduled)</option>
                      <option value="departed" className="text-blue-500">Đang chạy (Departed)</option>
                      <option value="arrived" className="text-green-500">Đã cập bến (Arrived)</option>
                      <option value="cancelled" className="text-red-500">Hủy chuyến (Cancelled)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteVessel(v.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded">Xoá</button>
                  </td>
                </tr>
              ))}
              {vessels.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center opacity-50">Log trống</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

