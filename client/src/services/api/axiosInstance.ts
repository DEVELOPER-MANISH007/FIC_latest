import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const STUDENT_TOKEN_KEY = "fic_student_token";
export const ADMIN_TOKEN_KEY = "fic_admin_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attaches the correct bearer token depending on whether the request
// targets an admin-only endpoint or a student/public endpoint.
api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith("/admin");
  const token = isAdminRoute ? localStorage.getItem(ADMIN_TOKEN_KEY) : localStorage.getItem(STUDENT_TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set multipart boundaries for file uploads.
  if (config.data instanceof FormData) {
    config.headers = config.headers || {};
    delete config.headers["Content-Type"];
  }
  return config;
});

// On 401, clear the relevant session so ProtectedRoute redirects to login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const isAdminRoute = error.config?.url?.startsWith("/admin");
      localStorage.removeItem(isAdminRoute ? ADMIN_TOKEN_KEY : STUDENT_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export const resolveImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const serverUrl = import.meta.env.VITE_SERVER_URL || "";
  return `${serverUrl}${path}`;
};

export default api;
