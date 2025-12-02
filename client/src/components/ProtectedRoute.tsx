import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute({ role }: { role?: string | null }) {
    const { auth } = useAuth();
    return auth.isLoggedIn && (!role || role === auth.role) ? <Outlet /> : <Navigate to="/login" />
}


