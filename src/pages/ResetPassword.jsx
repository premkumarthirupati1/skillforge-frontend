import { useEffect, useState, } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";
function ResetPassword() {
    const { token } = useParams();

    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const navigate = useNavigate();

    const [isVerifying, setIsVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                await api.post(`/auth/forgot-password/${token}/${email}`);
                setIsTokenValid(true);
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Reset link is invalid or has expired.";
                toast.error(errorMsg);
                setIsTokenValid(false);
            } finally {
                setIsVerifying(false);
            }
        };
        verifyToken();
    }, [token]);

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsSubmitting(true);
        try {
            await api.post(`/auth/reset-password/${email}`, { password });
            toast.success("Password updated successfully! Redirecting...");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to reset password.";
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // STATE A: Initial Token Verification Loading Spinner
    if (isVerifying) {
        return (
            <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-slate-600 font-medium animate-pulse">Verifying security token...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans p-4 text-slate-900">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full transition-all">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-3 font-bold text-2xl">
                        SF
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        {isTokenValid ? "Create New Password" : "Link Expired"}
                    </h2>
                </div>

                {isTokenValid ? (
                    /* STATE B: Token is Valid, Show Form */
                    <form onSubmit={handlePasswordReset} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 disabled:bg-indigo-400 flex items-center justify-center gap-2 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Updating Password...</span>
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>
                ) : (
                    /* STATE C: Token Is Invalid/Expired, Show Error UI */
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-600 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-600">
                            This token link is invalid, broken, or has timed out. Password reset links are valid for security purposes for only a limited window.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md"
                        >
                            Request New Reset Link
                        </Link>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                        Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default ResetPassword;