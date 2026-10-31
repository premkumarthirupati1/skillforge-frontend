import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/NavBar";
import StarRating from "../../components/StarRating";
import toast from "react-hot-toast";
import { CURATED_COURSES } from "../../data/coursesCatalogData";
import { 
    PlayCircle, 
    CheckCircle, 
    Lock, 
    Loader2, 
    Sparkles, 
    Award, 
    ShieldCheck, 
    Clock, 
    BookOpen, 
    ArrowLeft, 
    ChevronRight,
    Terminal,
    ArrowRight
} from "lucide-react";

function CourseDetails() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    
    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    
    const navigate = useNavigate();

    const fetchCourse = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const result = await api.get(`/course/${courseId}/full`);
            if (result.data?.course) {
                setCourse(result.data.course);
                setModules(result.data.modules || []);
                setIsEnrolled(!!result.data.isEnrolled);
                return;
            }
            throw new Error("Course not found in API response");
        } catch (err) {
            console.warn("API course not available, looking up fallback curriculum:", err);
            const fallback = CURATED_COURSES.find(c => c._id === courseId || c.slug === courseId);
            if (fallback) {
                setCourse(fallback);
                setModules(fallback.modules || []);
                setIsEnrolled(false);
            } else {
                setLoadError("Curriculum could not be found or loaded.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };
    const currentUser = parseJwt(localStorage.getItem("token"));

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/review/${courseId}`);
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error("Review fetch error:", err);
        }
    };

    const submitReview = async () => {
        try {
            await api.post(`/review/${courseId}`, { rating, comment: reviewComment });
            toast.success("Review saved successfully!");
            fetchReviews();
            setRating(0);
            setReviewComment("");
        } catch (err) {
            console.error("Review submit error:", err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        }
    };

    const [reviewToDelete, setReviewToDelete] = useState(null);

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await api.delete(`/review/${reviewToDelete}`);
            toast.success("Feedback deleted.");
            setReviewToDelete(null);
            fetchReviews();
        } catch (err) {
            toast.error("Failed to delete feedback");
        }
    };

    const editReview = (review) => {
        setRating(review.rating);
        setReviewComment(review.comment);
        window.scrollTo({ top: document.getElementById('review-form')?.offsetTop - 100, behavior: 'smooth' });
    };

    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const enrollCourse = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please log in to enroll in this course.");
            navigate(`/login?redirect=/course/${courseId}`);
            return;
        }

        try {
            setIsCheckoutLoading(true);

            if (Number(course.price) > 0) {
                // 1. Create Razorpay order
                const res = await api.post("/payment/create-order", { courseId });
                const { orderId, amount, currency, keyId } = res.data;

                if (!window.Razorpay) {
                    toast.error("Payment gateway failed to load. Please refresh and try again.");
                    setIsCheckoutLoading(false);
                    return;
                }

                // 2. Open Razorpay modal
                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency || "INR",
                    name: "SkillForge",
                    description: `Enrollment: ${course.title}`,
                    order_id: orderId,
                    handler: async function (response) {
                        try {
                            const verifyRes = await api.post("/payment/verify-payment", {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                courseId
                            });

                            if (verifyRes.data.success) {
                                setIsEnrolled(true);
                                toast.success("Payment verified! Course successfully unlocked 🎉");
                            }
                        } catch (verifyErr) {
                            console.error("Verification error:", verifyErr);
                            toast.error(verifyErr.response?.data?.message || "Payment verification failed.");
                        } finally {
                            setIsCheckoutLoading(false);
                        }
                    },
                    prefill: {
                        name: currentUser?.name || "",
                        email: currentUser?.email || ""
                    },
                    theme: {
                        color: "#6366F1"
                    },
                    modal: {
                        ondismiss: function () {
                            setIsCheckoutLoading(false);
                        }
                    }
                };

                const razorpayInstance = new window.Razorpay(options);
                razorpayInstance.on("payment.failed", function (response) {
                    console.error("Payment failed:", response.error);
                    toast.error(response.error.description || "Payment failed");
                    setIsCheckoutLoading(false);
                });
                razorpayInstance.open();
            } else {
                // Free course enrollment
                await api.post(`/enrollments/${courseId}/enroll`);
                setIsEnrolled(true);
                toast.success("Enrolled successfully in free course!");
                setIsCheckoutLoading(false);
            }
        } catch (err) {
            console.error("Checkout error:", err);
            toast.error(err.response?.data?.message || "Failed to process enrollment");
            setIsCheckoutLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
        fetchReviews();
    }, [courseId]);

    if (isLoading) return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-subtle">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-xs font-semibold tracking-widest uppercase">Loading Course Architecture...</p>
            </div>
        </div>
    );

    if (!course || loadError) return (
        <div className="bg-brand-bg min-h-screen text-slate-200">
            <NavBar />
            <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/10">
                    <BookOpen size={30} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Course Not Found
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                    {loadError || "This course curriculum is currently unavailable or may have been updated."}
                </p>
                <div className="pt-4 flex justify-center gap-3">
                    <button
                        onClick={() => navigate("/courses")}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/25 border border-indigo-400/30 hover:scale-105 transition-all"
                    >
                        Browse All Courses
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-brand-bg min-h-screen pb-20 selection:bg-brand-primary/30 selection:text-white font-sans relative">
            <NavBar />

            {/* HEADER SECTION */}
            <div className="relative border-b border-brand-border/60 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
                <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-brand-primary/10 blur-[140px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-10 grid md:grid-cols-3 gap-10 items-center">
                    <div className="md:col-span-2 space-y-4">
                        <button
                            onClick={() => navigate("/courses")}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors group mb-2"
                        >
                            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Courses</span>
                        </button>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="glass-card border border-brand-border text-brand-text text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                                {course.difficulty || "ALL LEVELS"}
                            </span>
                            <span className="text-brand-muted text-xs font-mono font-bold uppercase tracking-wider">{modules.length} Modules</span>
                            {course.reviewCount > 0 && (
                                <div className="flex items-center gap-1.5 ml-2">
                                    <StarRating rating={course.averageRating} readOnly size={13} />
                                    <span className="text-brand-muted text-xs font-bold">{course.averageRating?.toFixed(1)} ({course.reviewCount})</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black text-brand-text tracking-tight leading-[1.1]">
                            {course.title}
                        </h1>

                        <p className="text-sm sm:text-base text-brand-muted max-w-2xl leading-relaxed">
                            {course.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 grid lg:grid-cols-3 gap-8 relative z-20">
                
                {/* LEFT: CURRICULUM & REVIEWS */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Course Architecture */}
                    <div className="glass-card-elevated rounded-3xl shadow-xl border border-brand-border/80 overflow-hidden">
                        <div className="p-6 border-b border-brand-border/60 flex justify-between items-center bg-brand-surface/40">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-brand-text">Course Architecture</h2>
                                <p className="text-xs text-brand-muted mt-0.5">Step-by-step modular progression</p>
                            </div>
                            <span className={`text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                                isEnrolled 
                                    ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/25" 
                                    : "bg-brand-surface text-brand-muted border-brand-border"
                            }`}>
                                {isEnrolled ? 'Unlocked' : 'Locked'}
                            </span>
                        </div>

                        <div className="divide-y divide-brand-border/60">
                            {modules.map((module, index) => {
                                const isModuleDone = module.lessons && module.lessons.length > 0
                                    ? module.lessons.every(lesson => lesson.completed)
                                    : false;
                                return (
                                    <div
                                        key={module._id}
                                        onClick={() => {
                                            if (isEnrolled && module.lessons && module.lessons.length > 0) {
                                                navigate(`/lesson/${module.lessons[0]._id}?courseId=${courseId}`);
                                            }
                                        }}
                                        className={`group p-5 flex items-center gap-4 transition-all ${
                                            isEnrolled
                                                ? (module.lessons && module.lessons.length > 0 ? "cursor-pointer hover:bg-brand-elevated/60" : "cursor-not-allowed opacity-50")
                                                : "bg-brand-surface/20 opacity-80"
                                        }`}
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold border transition-all shrink-0 ${
                                                isModuleDone
                                                    ? "bg-brand-emerald/15 border-brand-emerald/30 text-brand-emerald"
                                                    : isEnrolled
                                                    ? "bg-brand-primary/15 border-brand-primary/30 text-brand-primary"
                                                    : "glass-card border-brand-border text-brand-subtle"
                                            }`}
                                        >
                                            {isModuleDone ? (
                                                <CheckCircle size={16} />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className={`font-semibold text-sm transition-all ${
                                                isEnrolled ? "text-brand-text group-hover:text-brand-primary" : "text-brand-muted"
                                            } ${isModuleDone ? "text-brand-subtle" : ""}`}>
                                                {module.title}
                                            </h3>
                                            {module.lessons && (
                                                <p className="text-[11px] text-brand-subtle mt-0.5">
                                                    {module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-brand-subtle">
                                            {isEnrolled ? (
                                                isModuleDone ? (
                                                    <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider">Done</span>
                                                ) : (
                                                    <PlayCircle size={18} className="group-hover:text-brand-primary transition-colors" />
                                                )
                                            ) : (
                                                <Lock size={15} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* REVIEWS SECTION */}
                    <div className="glass-card-elevated rounded-3xl shadow-xl border border-brand-border/80 p-6 sm:p-8">
                        <h2 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
                            <Sparkles size={18} className="text-brand-cyan" />
                            <span>Developer Feedback & Reviews</span>
                        </h2>
                        
                        {isEnrolled && (
                            <div id="review-form" className="mb-8 glass-card border border-brand-border p-5 rounded-2xl">
                                <h3 className="font-semibold text-brand-text mb-3 text-xs sm:text-sm">Leave a Review</h3>
                                <div className="mb-3">
                                    <StarRating rating={rating} setRating={setRating} size={20} />
                                </div>
                                <textarea 
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="What did you think of the architecture and coding sandboxes?"
                                    className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-brand-text placeholder-brand-subtle focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all mb-3 text-xs sm:text-sm resize-none"
                                    rows="3"
                                />
                                <button 
                                    onClick={submitReview}
                                    disabled={rating === 0}
                                    className="bg-brand-primary hover:bg-brand-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2 px-5 rounded-xl transition-all text-xs shadow-md shadow-brand-primary/25"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        )}

                        <div className="space-y-5">
                            {reviews.length === 0 ? (
                                <p className="text-brand-subtle text-xs italic">No reviews submitted yet. Be the first to review after enrolling!</p>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="border-b border-brand-border/60 pb-5 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {review.reviewerName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-brand-text text-xs block">
                                                        {review.reviewerName}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <StarRating rating={review.rating} readOnly size={11} />
                                                        <span className="text-[10px] text-brand-subtle font-mono">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {currentUser?.id === (review.user?._id || review.user) && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => editReview(review)} className="text-brand-muted hover:text-brand-primary text-[10px] font-semibold transition-colors">Edit</button>
                                                    <button onClick={() => setReviewToDelete(review._id)} className="text-brand-muted hover:text-red-400 text-[10px] font-semibold transition-colors">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-brand-muted text-xs sm:text-sm leading-relaxed pl-11">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: STICKY ENROLL CARD */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 glass-card-elevated rounded-3xl shadow-2xl border border-brand-border/80 p-6 sm:p-7">
                        <div className="text-center mb-6 pb-6 border-b border-brand-border/60">
                            <span className="text-xs text-brand-muted uppercase font-mono font-bold block mb-1">Tuition / Access</span>
                            <div className="text-3xl sm:text-4xl font-black text-brand-text">
                                {Number(course.price) === 0 ? "Free" : `₹${course.price}`}
                            </div>
                        </div>

                        {!isEnrolled ? (
                            <button
                                onClick={enrollCourse}
                                disabled={isCheckoutLoading}
                                className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary hover:from-brand-secondary hover:to-indigo-500 text-white disabled:opacity-70 font-bold py-3 rounded-xl transition-all mb-5 flex items-center justify-center gap-2 shadow-glow-primary/40 border border-white/10 text-xs sm:text-sm group"
                            >
                                {isCheckoutLoading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        <span>Processing Payment...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{Number(course.price) === 0 ? "Enroll for Free" : `Enroll Now · ₹${course.price}`}</span>
                                        <PlayCircle size={16} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    const firstValidModule = modules.find(m => m.lessons && m.lessons.length > 0);
                                    if (firstValidModule) {
                                        navigate(`/lesson/${firstValidModule.lessons[0]._id}?courseId=${courseId}`);
                                    } else {
                                        toast.error("No lessons found in this course yet.");
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary text-white font-bold py-3 rounded-xl transition-all mb-5 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-glow-primary/40 border border-white/10"
                            >
                                <PlayCircle size={16} />
                                <span>Resume Learning</span>
                            </button>
                        )}

                        <div className="space-y-3 text-xs text-brand-muted font-medium">
                            <div className="flex items-center gap-2.5">
                                <Lock size={15} className="text-brand-primary shrink-0" />
                                <span>Lifetime Course & Sandbox Access</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Award size={15} className="text-brand-emerald shrink-0" />
                                <span>Cryptographically Verified Certificate</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Terminal size={15} className="text-brand-cyan shrink-0" />
                                <span>Forge Copilot AI Reviews Included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DELETE REVIEW MODAL */}
            {reviewToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-md animate-in fade-in duration-150">
                    <div className="glass-card-elevated border border-brand-border rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-brand-text mb-2">Delete Feedback</h3>
                        <p className="text-brand-muted text-xs mb-6">
                            Are you sure you want to permanently delete this review? This action cannot be undone.
                        </p>
                        <div className="flex gap-2.5 justify-end">
                            <button
                                onClick={() => setReviewToDelete(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text glass-card hover:bg-brand-elevated transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteReview}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseDetails;
