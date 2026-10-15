import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function ProtectedRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("token");
    
    if (!token) {
        toast.error("Please sign in to access this engineering workspace", { id: "auth-guard-redirect" });
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    try {
        // Decode the payload of the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            toast.error("Session expired. Please sign in again.", { id: "auth-guard-expired" });
            return <Navigate to="/login" replace state={{ from: location }} />;
        }
    } catch (e) {
        // If token is invalid/malformed, clear it and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default ProtectedRoute;  