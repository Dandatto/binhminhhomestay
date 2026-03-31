"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/components/AdminContext";
import type { OperationalMetrics } from "@/lib/domain";

export default function AdminMonitor() {
  const { token } = useAdmin();
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(setMetrics);
  }, [token]);

  if (!metrics) return <div className="p-8 text-ocean-blue/50">Đang tải cấu hình máy chủ...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-ocean-blue">Giám sát hệ thống</h1>
        <p className="text-ocean-blue/60 mt-1">Ping rate: realtime. Đo lường sức khỏe Server, Database và Background queues.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard label="Tổng đơn đặt" value={metrics.bookingsTotal} />
        <MetricCard label="Đơn chờ duyệt" value={metrics.bookingsPending} highlight />
      </div>

      <div>
        <h2 className="text-xl font-bold text-ocean-blue mb-4">Background Worker (Outbox)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Đang chờ (Pending)" value={metrics.outboxPending} color="text-yellow-600" />
          <MetricCard label="Đang chạy (Processing)" value={metrics.outboxProcessing} color="text-blue-500" />
          <MetricCard label="Hoàn thành (Done)" value={metrics.outboxDone} color="text-green-500" />
          <MetricCard label="Lỗi (Failed)" value={metrics.outboxFailed} color="text-red-500" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-ocean-blue mb-4">Idempotency Keys (API Locks)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="In Progress" value={metrics.idempotencyInProgress} color="text-blue-500" />
          <MetricCard label="Completed" value={metrics.idempotencyCompleted} color="text-green-500" />
          <MetricCard label="Failed" value={metrics.idempotencyFailed} color="text-red-500" />
        </div>
      </div>

      <p className="text-xs text-ocean-blue/50 italic">Cập nhật lần cuối: {new Date(metrics.generatedAt).toLocaleString('vi-VN')}</p>
    </div>
  );
}

function MetricCard({ label, value, color, highlight }: { label: string, value: number, color?: string, highlight?: boolean }) {
  return (
    <div className={`bg-white p-6 rounded-3xl shadow-soft border ${highlight ? 'border-sunrise-yellow/50 bg-sunrise-yellow/5' : 'border-sky-blue/10'}`}>
      <p className="text-xs font-bold text-ocean-blue/50 uppercase tracking-widest">{label}</p>
      <p className={`text-5xl font-black mt-3 ${color || 'text-ocean-blue'}`}>{value}</p>
    </div>
  );
}
