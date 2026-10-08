import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast";
import { ChevronLeft, PlayCircle, FileText, CheckCircle, Clock } from "lucide-react";

function LessonsView() {
    const [lessons, setLessons] = useState([]);
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [courseId, setCourseId] = useState(null);
    const [moduleTitle, setModuleTitle] = useState("");
    const [loading, setIsLoading] = useState(true);
    const { moduleId } = useParams();
    const navigate = useNavigate();

    const fetchLessonsAndProgress = async () => {
        try {
            const moduleRes = await api.get(`/modules/${moduleId}`);
            setLessons(moduleRes.data.lessons || []);

            const moduleObj = moduleRes.data.module || moduleRes.data;
            setModuleTitle(moduleObj.title || "");
            
            const structuralCourseId = moduleObj.courseId || moduleObj.course;
            setCourseId(structuralCourseId);

            if (structuralCourseId) {
                const progressRes = await api.get(`/enrollments/${structuralCourseId}/progress`);
                const completedList = progressRes.data.completedLessons || [];
                setCompletedLessonIds(completedList.map(item => typeof item === 'object' && item !== null ? item._id : item.toString()));
            }
        } catch (err) {
            console.error("Error fetching context tracking metrics:", err);
            toast.error("Failed to sync classroom parameters.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLessonsAndProgress();
    }, [moduleId]);

    const handleComplete = async (e, lessonId) => {
        e.stopPropagation();

        if (!courseId) {
            return toast.error("Course reference context is missing.");
        }

        try {
            const res = await api.patch(`/enrollments/${courseId}/toggle-lesson`, { lessonId });
            const updatedCompleted = res.data.completedLessons || [];
            setCompletedLessonIds(updatedCompleted.map(item => typeof item === 'object' && item !== null ? item._id : item.toString()));
            toast.success("Progress updated successfully!");
        } catch (err) {
            console.error("Error toggling completion:", err);
            toast.error("Failed to update task checkmark.");
        }
    };

    const handleLessonNavigation = (lessonId) => {
        if (courseId) {
            navigate(`/lesson/${lessonId}?courseId=${courseId}`);
        } else {
            console.warn("⚠️ Cannot pass course context: courseId state variable is empty!");
            navigate(`/lesson/${lessonId}`);
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-bg min-h-screen transition-colors duration-page">
                <NavBar />
                <div className="max-w-5xl mx-auto py-12 px-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-brand-surface border border-brand-border animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-bg min-h-screen font-sans transition-colors duration-page relative overflow-hidden">
            <NavBar />
            
            {/* Visual Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none z-0 animate-ambient-glow" />

            <div className="max-w-5xl mx-auto py-12 px-6 relative z-10">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors mb-8 group bg-transparent border-0 cursor-pointer font-sans"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm">Return to Course Overview</span>
                </button>

                <header className="mb-10">
                    <h1 className="text-3xl font-black text-brand-text tracking-tight text-glow capitalize">
                        {moduleTitle || "Module Content"}
                    </h1>
                    <p className="text-brand-subtle mt-1">Select a segment to initialize media playback.</p>
                </header>

                {lessons.length > 0 ? (
                    <div className="grid gap-4">
                        {[...lessons].sort((a, b) => (a.order || 0) - (b.order || 0)).map((lesson) => {
                            const isLessonDone = completedLessonIds.includes(lesson._id.toString());

                            return (
                                <div
                                    key={lesson._id}
                                    onClick={() => handleLessonNavigation(lesson._id)}
                                    className={`group bg-brand-surface border p-5 rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-all duration-card cursor-pointer flex items-center justify-between ${
                                        isLessonDone ? 'border-brand-border' : 'border-brand-border hover:border-brand-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <button
                                            type="button"
                                            onClick={(e) => handleComplete(e, lesson._id)}
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold transition-all duration-300 border-0 cursor-pointer shrink-0 ${
                                                isLessonDone
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-brand-elevated text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary border border-brand-border hover:border-brand-primary/30'
                                            }`}
                                        >
                                            {isLessonDone ? (
                                                <CheckCircle size={20} />
                                            ) : (
                                                lesson.order || "-"
                                            )}
                                        </button>

                                        {lesson.contentType === 'video' ? (
                                            <div className="w-48 aspect-video shrink-0 rounded-lg overflow-hidden bg-black relative border border-brand-border shadow-inner">
                                                <video 
                                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${lesson.content}#t=2`} 
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    preload="metadata"
                                                    muted
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-48 aspect-video shrink-0 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-subtle group-hover:text-brand-primary transition-colors shadow-inner">
                                                <FileText size={32} />
                                            </div>
                                        )}

                                        <div>
                                            <h3 className={`font-bold text-lg transition-colors ${
                                                isLessonDone ? 'text-brand-subtle' : 'text-brand-text group-hover:text-brand-primary'
                                            }`}>
                                                {lesson.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-elevated border border-brand-border text-brand-subtle rounded uppercase tracking-wider flex items-center gap-1.5">
                                                    {lesson.contentType === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />}
                                                    {lesson.contentType}
                                                </span>
                                                <span className="text-[11px] text-brand-muted font-medium flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {lesson.duration} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-brand-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                        Initialize <ChevronLeft size={16} className="rotate-180" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border">
                        <p className="text-brand-muted font-medium text-lg">No content streams available in this module yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LessonsView;
