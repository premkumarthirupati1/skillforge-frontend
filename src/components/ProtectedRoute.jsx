import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function ProtectedRoute({ children }) {
    const location = useLocation();
    const { isAuthenticated, isLoading, token } = useAuth();
    
    // While checking initial authentication session, show dark developer loader
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs font-mono text-neutral-400 tracking-wider uppercase">
                        Verifying Workspace Security...
                    </span>
                </div>
            </div>
        );
    }

    if (!token && !isAuthenticated) {
        toast.error("Please sign in to access this engineering workspace", { id: "auth-guard-redirect" });
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default ProtectedRoute;
