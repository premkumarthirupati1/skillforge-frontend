import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import NavBar from "../../components/NavBar";

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState("");

    const sessionId = searchParams.get("session_id");
    const courseId = searchParams.get("course_id");

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            setErrorMessage("No session ID found.");
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await api.post("/payment/verify-session", { session_id: sessionId });
                if (res.status === 200) {
                    setStatus("success");
                    setTimeout(() => {
                        navigate(`/course/${res.data.courseId}`);
                    }, 2500);
                }
            } catch (error) {
                console.error("Payment verification failed:", error);
                setStatus("error");
                setErrorMessage(error.response?.data?.message || "Failed to verify payment with the server.");
            }
        };

        verifyPayment();
    }, [sessionId, navigate]);

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans relative selection:bg-brand-primary/30 selection:text-white">
            <NavBar />
            
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/15 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="flex-grow flex items-center justify-center p-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card-elevated rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-brand-border/80"
                >
                    {status === "verifying" && (
                        <div className="space-y-5 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                                <Loader2 size={32} className="text-brand-primary animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black text-brand-text tracking-tight">Verifying Transaction...</h2>
                            <p className="text-brand-muted text-xs sm:text-sm leading-relaxed">
                                Securely confirming your payment with the banking network. Please do not close or refresh this page.
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-5 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shadow-sm">
                                <CheckCircle size={36} />
                            </div>
                            <h2 className="text-2xl font-black text-brand-text tracking-tight">Payment Verified!</h2>
                            <p className="text-brand-muted text-xs sm:text-sm leading-relaxed">
                                You are now enrolled in the track. Redirecting to your engineering curriculum now...
                            </p>
                            <div className="w-full bg-brand-surface rounded-full h-1 overflow-hidden">
                                <motion.div 
                                    className="bg-brand-emerald h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5 }}
                                />
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-5 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm">
                                <XCircle size={36} />
                            </div>
                            <h2 className="text-2xl font-black text-brand-text tracking-tight">Verification Incomplete</h2>
                            <p className="text-brand-muted text-xs sm:text-sm mb-2 leading-relaxed">
                                {errorMessage}
                            </p>
                            <button 
                                onClick={() => navigate(courseId ? `/course/${courseId}` : "/dashboard")}
                                className="bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold px-6 py-3 rounded-xl w-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-primary/40 border border-white/10"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
