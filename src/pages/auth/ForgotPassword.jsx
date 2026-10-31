import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col relative overflow-hidden selection:bg-brand-primary/30 selection:text-white">
            <NavBar />

            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/15 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 relative z-10">
                <div className="w-full max-w-[440px]">
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="glass-card-elevated rounded-3xl p-7 sm:p-9 shadow-2xl relative border border-brand-border/80"
                    >
                        {/* Card Header */}
                        <div className="mb-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-4">
                                <KeyRound size={13} />
                                <span>Account Recovery</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                                {isSubmitted ? "Check your inbox" : "Forgot Password"}
                            </h2>
                            <p className="text-brand-muted mt-1 text-xs sm:text-sm">
                                {isSubmitted
                                    ? "We have dispatched secure recovery instructions to your email."
                                    : "Enter your registered email and we'll send you a password reset link."}
                            </p>
                        </div>

                        {error && !isSubmitted && (
                            <motion.div 
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                                transition={{ duration: 0.35 }}
                                className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-medium"
                            >
                                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                                            className="w-full bg-brand-surface/90 text-brand-text placeholder-brand-subtle border border-brand-border hover:border-brand-primary/40 focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 rounded-xl transition-all shadow-glow-primary/40 hover:shadow-glow-primary/60 flex items-center justify-center gap-2 mt-3 disabled:opacity-70 disabled:cursor-not-allowed group text-sm border border-white/10"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Sending link...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        ) : (
                            <div className="space-y-4 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle2 size={28} />
                                </div>

                                <div className="p-3 bg-brand-surface/80 border border-brand-border/60 rounded-xl">
                                    <span className="text-[11px] text-brand-subtle block mb-0.5">Sent to</span>
                                    <span className="font-mono text-xs sm:text-sm text-brand-text font-semibold break-all">
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
                                        className="text-xs font-semibold text-brand-primary hover:underline transition-colors"
                                    >
                                        Didn't receive the email? Try another address
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-7 pt-5 border-t border-brand-border/60 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Back to Sign In</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
