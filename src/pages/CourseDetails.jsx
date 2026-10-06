import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import StarRating from "../components/StarRating";
import toast from "react-hot-toast";
import { PlayCircle, CheckCircle, Lock, Loader2, Sparkles, Award } from "lucide-react";

function CourseDetails() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    
    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    
    const navigate = useNavigate();

    const fetchCourse = async () => {
        try {
            const result = await api.get(`/course/${courseId}/full`);
            setCourse(result.data.course);
            setModules(result.data.modules);
            setIsEnrolled(result.data.isEnrolled);
        } catch (err) {
            console.log(err);
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
            console.log(err);
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
            console.log(err);
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
        try {
            if (Number(course.price) > 0) {
                setIsCheckoutLoading(true);
                const res = await api.post("/payment/create-checkout-session", { courseId });
                window.location.href = res.data.url;
            } else {
                await api.post(`/enrollments/${courseId}/enroll`);
                setIsEnrolled(true);
                toast.success("Enrolled successfully!");
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to enroll");
            setIsCheckoutLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
        fetchReviews();
    }, [courseId]);

    if (!course) return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-subtle">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-sm font-medium tracking-widest uppercase">Loading Course...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-brand-bg min-h-screen pb-20 transition-colors duration-page">
            <NavBar />

            {/* HEADER SECTION */}
            <div className="relative border-b border-brand-border overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

                <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 grid md:grid-cols-3 gap-12 items-center">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-brand-elevated border border-brand-border text-brand-text text-[10px] font-bold uppercase px-2.5 py-1 rounded tracking-wider">
                                {course.difficulty}
                            </span>
                            <span className="text-brand-subtle text-xs font-bold uppercase tracking-wider">{modules.length} Modules</span>
                            {course.reviewCount > 0 && (
                                <div className="flex items-center gap-2 ml-4">
                                    <StarRating rating={course.averageRating} readOnly size={14} />
                                    <span className="text-brand-subtle text-xs font-bold">{course.averageRating?.toFixed(1)} ({course.reviewCount})</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-brand-text mb-6 tracking-tight leading-[1.1]">
                            {course.title}
                        </h1>
                        <p className="text-lg text-brand-muted max-w-2xl leading-relaxed">
                            {course.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-8 grid lg:grid-cols-3 gap-8 relative z-20">
                
                {/* LEFT: CURRICULUM */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-brand-surface rounded-2xl shadow-2xl border border-brand-border overflow-hidden">
                        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/50">
                            <h2 className="text-lg font-bold text-brand-text">Course Architecture</h2>
                            <span className="text-xs font-bold tracking-wider uppercase text-brand-subtle">
                                {isEnrolled ? 'Unlocked' : 'Locked'}
                            </span>
                        </div>

                        <div className="divide-y divide-brand-border">
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
                                        className={`group p-5 flex items-center gap-4 transition-colors ${
                                            isEnrolled
                                                ? (module.lessons && module.lessons.length > 0 ? "cursor-pointer hover:bg-brand-elevated/50" : "cursor-not-allowed opacity-50")
                                                : "bg-brand-bg/30 opacity-80"
                                        }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border transition-all shrink-0
                                            ${isModuleDone
                                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                : isEnrolled
                                                    ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                                                    : "bg-brand-elevated border-brand-border text-brand-subtle"
                                            }`}
                                        >
                                            {isModuleDone ? (
                                                <CheckCircle size={18} />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className={`font-semibold transition-all ${
                                                isEnrolled ? "text-brand-text group-hover:text-brand-primary" : "text-brand-muted"
                                            } ${isModuleDone ? "text-brand-subtle" : ""}`}>
                                                {module.title}
                                            </h3>
                                        </div>

                                        <div className="text-brand-subtle">
                                            {isEnrolled ? (
                                                isModuleDone ? (
                                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Done</span>
                                                ) : (
                                                    <PlayCircle size={20} className="group-hover:text-brand-primary transition-colors" />
                                                )
                                            ) : (
                                                <Lock size={16} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* REVIEWS SECTION */}
                    <div className="bg-brand-surface rounded-2xl shadow-xl border border-brand-border p-8">
                        <h2 className="text-xl font-bold text-brand-text mb-8 flex items-center gap-2">
                            <Sparkles size={20} className="text-brand-primary" />
                            Engineer Feedback
                        </h2>
                        
                        {isEnrolled && (
                            <div id="review-form" className="mb-10 bg-brand-elevated border border-brand-border p-6 rounded-xl">
                                <h3 className="font-semibold text-brand-text mb-4 text-sm">Leave a Review</h3>
                                <div className="mb-4">
                                    <StarRating rating={rating} setRating={setRating} size={24} />
                                </div>
                                <textarea 
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="What did you think of this course?"
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-4 text-brand-text placeholder-brand-subtle focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all mb-4 text-sm resize-none"
                                    rows="3"
                                ></textarea>
                                <button 
                                    onClick={submitReview}
                                    disabled={rating === 0}
                                    className="bg-brand-text text-brand-bg hover:bg-brand-text/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-brand-subtle text-sm">No feedback submitted yet.</p>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="border-b border-brand-border pb-6 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-lg flex items-center justify-center font-bold">
                                                    {review.reviewerName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-brand-text text-sm">{review.reviewerName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <StarRating rating={review.rating} readOnly size={12} />
                                                        <span className="text-[10px] text-brand-subtle font-medium uppercase tracking-wider">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {currentUser?.id === (review.user?._id || review.user) && (
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => editReview(review)} className="text-brand-subtle hover:text-brand-primary text-[10px] font-bold uppercase tracking-wider transition-colors">Edit</button>
                                                    <button onClick={() => setReviewToDelete(review._id)} className="text-brand-subtle hover:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-brand-muted text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: STICKY ENROLL CARD */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-brand-surface rounded-2xl shadow-2xl border border-brand-border p-8">
                        <div className="text-center mb-8 pb-8 border-b border-brand-border">
                            <div className="text-4xl font-black text-brand-text">
                                {Number(course.price) === 0 ? "Free" : `$${course.price}`}
                            </div>
                        </div>

                        {!isEnrolled ? (
                            <button
                                onClick={enrollCourse}
                                disabled={isCheckoutLoading}
                                className="w-full bg-brand-text text-brand-bg hover:bg-brand-text/90 disabled:opacity-70 font-bold py-3.5 rounded-xl transition-all mb-6 flex items-center justify-center gap-2 group"
                            >
                                {isCheckoutLoading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Initialize Course
                                        <PlayCircle size={18} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    // Try to find the first module with lessons
                                    const firstValidModule = modules.find(m => m.lessons && m.lessons.length > 0);
                                    if (firstValidModule) {
                                        navigate(`/lesson/${firstValidModule.lessons[0]._id}?courseId=${courseId}`);
                                    } else {
                                        toast.error("No lessons found in this course yet.");
                                    }
                                }}
                                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all mb-6 flex items-center justify-center gap-2"
                            >
                                <PlayCircle size={18} />
                                Resume Learning
                            </button>
                        )}

                        <div className="space-y-4 text-sm text-brand-muted font-medium">
                            <div className="flex items-center gap-3">
                                <Lock size={16} className="text-brand-primary" />
                                Lifetime Repository Access
                            </div>
                            <div className="flex items-center gap-3">
                                <Award size={16} className="text-brand-primary" />
                                Verified Certificate
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {reviewToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-brand-text mb-2">Delete Feedback</h3>
                        <p className="text-brand-subtle text-sm mb-6">
                            Are you sure you want to permanently delete this review? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setReviewToDelete(null)}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-brand-text bg-brand-elevated hover:bg-brand-elevated/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteReview}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
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