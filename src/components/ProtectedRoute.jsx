import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        return <Navigate to="/login" />;
    }

    try {
        // Decode the payload of the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            return <Navigate to="/login" />;
        }
    } catch (e) {
        // If token is invalid/malformed, clear it and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;  