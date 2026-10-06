import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import NavBar from "../components/NavBar";

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
                    }, 3000);
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <NavBar />
            
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-200 dark:border-slate-800">
                    {status === "verifying" && (
                        <div className="space-y-6 flex flex-col items-center">
                            <Loader2 size={64} className="text-blue-600 animate-spin" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verifying Payment...</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Please wait while we securely verify your transaction with Stripe. Do not close this page.
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <CheckCircle size={64} className="text-emerald-500" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                You are now enrolled in the course. Redirecting you to the course curriculum...
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <XCircle size={64} className="text-rose-500" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                {errorMessage}
                            </p>
                            <button 
                                onClick={() => navigate(courseId ? `/course/${courseId}` : "/dashboard")}
                                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl w-full hover:bg-blue-700 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
