import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function UnauthenticatedRoute() {
    const { auth } = useAuth();
    return auth.isLoggedIn ? <Navigate to="/" /> : <Outlet />
}

