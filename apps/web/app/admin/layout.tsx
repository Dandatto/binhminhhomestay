export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-sand-white">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-ocean-blue text-white p-6">
        <h2 className="font-heading text-2xl font-bold mb-8 text-sunrise-yellow">Căn cứ</h2>
        <nav className="flex flex-col gap-4">
          <a href="/admin" className="font-medium hover:text-sunrise-yellow transition-colors">Dashboard</a>
          <a href="/admin/bookings" className="font-medium hover:text-sunrise-yellow transition-colors">Đơn đặt phòng</a>
          <a href="/admin/pricing" className="font-medium hover:text-sunrise-yellow transition-colors">Quản lý giá</a>
          <a href="/admin/vessels" className="font-medium hover:text-sunrise-yellow transition-colors">Lịch tàu</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto md:max-w-none md:mx-0 relative">
        {children}
      </main>
    </div>
  );
}
