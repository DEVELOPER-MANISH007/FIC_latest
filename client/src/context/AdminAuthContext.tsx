import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AdminUser, LoginFormData } from "@/types";
import { loginAdmin, getAdminMe } from "@/services/api/adminAuth.service";
import { ADMIN_TOKEN_KEY } from "@/services/api/axiosInstance";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
  replaceSession: (token: string, admin: AdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getAdminMe()
      .then(setAdmin)
      .catch(() => localStorage.removeItem(ADMIN_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (data: LoginFormData) => {
    const result = await loginAdmin(data);
    if (!result) return;
    localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    setAdmin(result.admin);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdmin(null);
  };

  const replaceSession = (token: string, updatedAdmin: AdminUser) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAdmin(updatedAdmin);
  };

  return <AdminAuthContext.Provider value={{ admin, loading, login, logout, replaceSession }}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
};
