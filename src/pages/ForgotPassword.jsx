import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return toast.error("Please enter a valid email address");
        }

        setIsLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setIsSubmitted(true);
            toast.success("Reset link sent successfully!");

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong";
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans p-4 text-slate-900">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full transition-all">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-3 font-bold text-2xl">
                        SF
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Reset Password</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        {!isSubmitted
                            ? "Enter your email address and we'll send you a link to reset your password."
                            : "Check your inbox for the recovery details."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 disabled:bg-indigo-400 flex items-center justify-center gap-2 text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Sending Link...</span>
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l9-6 9 6M4 11v8M20 11v8" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-600">
                            An email has been sent to <span className="font-semibold text-slate-800">{email}</span>. Click the link in the email to securely reset your password.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                        >
                            Didn't get the email? Try again
                        </button>
                    </div>
                )}

                {/* Back to Sign In Link */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1">
                        ← Back to Sign In
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default ForgotPassword;