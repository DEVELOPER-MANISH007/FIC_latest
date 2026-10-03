import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Loading from "./Loading";

/** Restricts nested routes to logged-in admins (role-based access). */
const AdminProtectedRoute = () => {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!admin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default AdminProtectedRoute;

