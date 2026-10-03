import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loading from "./Loading";

/** Restricts nested routes to logged-in students. */
const ProtectedRoute = () => {
  const { student, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!student) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default ProtectedRoute;

