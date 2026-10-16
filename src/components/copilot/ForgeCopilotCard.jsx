import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";

export default function ForgeCopilotCard({ course, onNavigate }) {
    const navigate = useNavigate();
    if (!course) return null;

    const handleClick = () => {
        if (onNavigate) onNavigate();
        navigate(`/course/${course._id}`);
    };

    const getDifficultyColor = (diff) => {
        switch ((diff || "").toLowerCase()) {
            case "beginner":
                return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "intermediate":
                return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            case "advanced":
                return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            default:
                return "text-slate-400 bg-white/5 border-white/10";
        }
    };

    const thumbnailSrc = course.thumbnail 
        ? (course.thumbnail.startsWith("http") ? course.thumbnail : getImageUrl(course.thumbnail))
        : "/images/skillforge-icon.png";

    return (
        <div className="group relative my-2.5 rounded-xl border border-white/10 bg-[#0C101A] hover:border-brand-primary/40 transition-all p-3 shadow-md flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-white/5 shrink-0 flex items-center justify-center">
                    <img 
                        src={thumbnailSrc} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/skillforge-icon.png";
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                            {course.difficulty || "Course"}
                        </span>
                        {course.price === 0 ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                                Free
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">
                                ${course.price}
                            </span>
                        )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                        {course.title}
                    </h4>
                    {course.tags && course.tags.length > 0 && (
                        <p className="text-[11px] text-brand-muted line-clamp-1 mt-0.5">
                            {course.tags.slice(0, 3).join(" • ")}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={handleClick}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/30 text-xs font-semibold transition-all"
            >
                <span>View Course</span>
                <ArrowRight size={13} />
            </button>
        </div>
    );
}
