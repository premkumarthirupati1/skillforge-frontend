import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!cleanEmail || !emailRegex.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/forgot-password", { email: cleanEmail });
            setIsSubmitted(true);
            toast.success("Password reset instructions dispatched!");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to send reset link. Please try again.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page flex flex-col relative overflow-hidden">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-hero">
                <div className="w-full max-w-[440px]">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-9 shadow-2xl relative backdrop-blur-xl">

                        {/* Card Header */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-4">
                                <KeyRound size={13} />
                                <span>Account Recovery</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                                {isSubmitted ? "Check your inbox" : "Forgot Password"}
                            </h2>
                            <p className="text-brand-subtle mt-1.5 text-sm">
                                {isSubmitted
                                    ? "We have dispatched secure recovery instructions to your email."
                                    : "Enter your registered email and we'll send you a password reset link."}
                            </p>
                        </div>

                        {error && !isSubmitted && (
                            <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium animate-in fade-in duration-200">
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                <span>{error}</span>
                            </div>
                        )}

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-subtle group-focus-within:text-brand-primary transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            required
                                            placeholder="you@domain.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error) setError("");
                                            }}
                                            disabled={isLoading}
                                            className="w-full bg-brand-elevated text-brand-text placeholder-brand-subtle border border-brand-border focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 group text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Sending link...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-5 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                    <CheckCircle2 size={28} />
                                </div>

                                <div className="p-3.5 bg-brand-elevated border border-brand-border rounded-xl">
                                    <span className="text-xs text-brand-subtle block mb-1">Sent to</span>
                                    <span className="font-mono text-sm text-brand-text font-semibold break-all">
                                        {email}
                                    </span>
                                </div>

                                <p className="text-xs text-brand-muted leading-relaxed">
                                    Click the security link in the email to reset your password. The link will safely expire in <strong className="text-brand-text">15 minutes</strong>. Check your spam folder if it doesn't appear.
                                </p>

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSubmitted(false);
                                            setError("");
                                        }}
                                        className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                                    >
                                        Didn't receive the email? Try another address
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-brand-border/60 text-center">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                <span>Back to Sign In</span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
