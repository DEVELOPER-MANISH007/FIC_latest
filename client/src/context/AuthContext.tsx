import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginFormData, StudentUser } from "@/types";
import { loginStudent, getStudentMe } from "@/services/api/studentAuth.service";
import { STUDENT_TOKEN_KEY } from "@/services/api/axiosInstance";

interface AuthContextValue {
  student: StudentUser | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
  updateStudent: (student: StudentUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Student authentication context. Persists the JWT under a fixed
 * localStorage key ("Remember Login") and rehydrates the session by
 * calling /student/auth/me on load.
 *
 * There is intentionally no `signup` here — public self-registration was
 * removed (see #9, Student Authentication Update); every student account
 * is created by Admin via the Student Management panel.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STUDENT_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getStudentMe()
      .then(setStudent)
      .catch(() => localStorage.removeItem(STUDENT_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (data: LoginFormData) => {
    const result = await loginStudent(data);
    if (!result) return;
    localStorage.setItem(STUDENT_TOKEN_KEY, result.token);
    setStudent(result.student);
  };

  const logout = () => {
    localStorage.removeItem(STUDENT_TOKEN_KEY);
    setStudent(null);
  };

  const updateStudent = (updated: StudentUser) => setStudent(updated);

  return (
    <AuthContext.Provider value={{ student, loading, login, logout, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
