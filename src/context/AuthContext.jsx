import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);
    const [isLoading, setIsLoading] = useState(true);

    // Synchronize user profile from backend
    const fetchCurrentUser = useCallback(async () => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setUser(null);
            setIsLoading(false);
            return null;
        }

        try {
            const res = await api.get("/auth/me");
            if (res.data?.success && res.data.user) {
                setUser(res.data.user);
                // Sync helper items in localStorage
                localStorage.setItem("userId", res.data.user.id);
                localStorage.setItem("role", res.data.user.role);
                localStorage.setItem("userName", res.data.user.name || "");
                localStorage.setItem("userEmail", res.data.user.email);
                return res.data.user;
            }
            return null;
        } catch (err) {
            // Token might be invalid or expired; interceptor handles refresh or cleans up
            if (err.response?.status === 401) {
                setUser(null);
                setToken(null);
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load: verify session
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Handle incoming auth response (token, refreshToken, user)
    const handleAuthSuccess = useCallback((authData) => {
        if (authData.token) {
            localStorage.setItem("token", authData.token);
            setToken(authData.token);
        }
        if (authData.refreshToken) {
            localStorage.setItem("refreshToken", authData.refreshToken);
        }
        if (authData.user) {
            setUser(authData.user);
            localStorage.setItem("userId", authData.user.id);
            localStorage.setItem("role", authData.user.role);
            localStorage.setItem("userName", authData.user.name || "");
            localStorage.setItem("userEmail", authData.user.email);
        }
    }, []);

    // Login action
    const login = useCallback(async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        if (res.data?.requiresOtp) {
            return { requiresOtp: true, email: res.data.email, message: res.data.message };
        }
        handleAuthSuccess(res.data);
        return { success: true, user: res.data.user };
    }, [handleAuthSuccess]);

    // Signup action
    const signup = useCallback(async ({ name, email, password, role }) => {
        const res = await api.post("/auth/signup", { name, email, password, role });
        if (res.data?.requiresOtp) {
            return { requiresOtp: true, email: res.data.email, message: res.data.message };
        }
        handleAuthSuccess(res.data);
        return { success: true, user: res.data.user };
    }, [handleAuthSuccess]);

    // Verify OTP action
    const verifyOtp = useCallback(async (email, otp) => {
        const res = await api.post("/auth/verify-otp", { email, otp });
        handleAuthSuccess(res.data);
        return res.data;
    }, [handleAuthSuccess]);

    // Resend OTP action
    const resendOtp = useCallback(async (email) => {
        const res = await api.post("/auth/resend-otp", { email });
        return res.data;
    }, []);

    // Single Device Logout
    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.warn("Logout error:", e.message);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            setToken(null);
            setUser(null);
        }
    }, []);

    // Global Logout (All Devices)
    const logoutAll = useCallback(async () => {
        try {
            await api.post("/auth/logout-all");
        } catch (e) {
            console.warn("Logout all error:", e.message);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            setToken(null);
            setUser(null);
        }
    }, []);

    // Change Password
    const changePassword = useCallback(async ({ currentPassword, newPassword, confirmPassword }) => {
        const res = await api.post("/auth/change-password", {
            currentPassword,
            newPassword,
            confirmPassword
        });
        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
        }
        if (res.data?.refreshToken) {
            localStorage.setItem("refreshToken", res.data.refreshToken);
        }
        await fetchCurrentUser();
        return res.data;
    }, [fetchCurrentUser]);

    const value = {
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
        logoutAll,
        changePassword,
        refreshUser: fetchCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
