"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface AdminContextType {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({ token: null, setToken: () => {}, logout: () => {} });

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (t) setTokenState(t);
    setLoading(false);
  }, []);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem("admin_token", t);
    else localStorage.removeItem("admin_token");
    setTokenState(t);
  };

  const logout = () => {
    setToken(null);
  };

  if (loading) return null;

  if (!token) {
    return (
      <div className="min-h-screen bg-sand-white flex items-center justify-center p-6">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("token") as HTMLInputElement).value;
            setToken(val);
          }} 
          className="bg-white p-8 rounded-3xl shadow-soft w-full max-w-sm border border-sky-blue/20"
        >
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-2xl font-black text-ocean-blue mt-2">Khu Vực Quản Trị</h1>
            <p className="text-sm text-ocean-blue/50">Mật khẩu cấp độ Hệ thống</p>
          </div>
          <input
            name="token"
            type="password"
            placeholder="Nhập khóa WORKER_DISPATCH_TOKEN"
            className="w-full border border-sky-blue/30 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-ocean-blue shadow-inner"
          />
          <button type="submit" className="w-full bg-ocean-blue text-white rounded-xl py-3 font-bold hover:bg-ocean-blue/90 shadow-md">
            Xác thực
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
