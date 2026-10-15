import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ChevronLeft, Save, Loader2, Video, FileText, HelpCircle, Clock, Eye } from "lucide-react";
import api from "../../api";
import NavBar from "../../components/NavBar";

function EditLesson() {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        contentType: "video",
        content: "",
        duration: "",
        order: ""
    });

    const fetchLesson = useCallback(async () => {
        try {
            const res = await api.get(`/lessons/get-lesson/${lessonId}`);
            const { title, contentType, content, duration, order } = res.data;

            setFormData({
                title: title || "",
                contentType: contentType || "video",
                content: content || "",
                duration: duration || 5,
                order: order || 1
            });
        } catch (err) {
            toast.error("Failed to load lesson details");
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        fetchLesson();
    }, [fetchLesson]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) return toast.error("Lesson title is required");

        setIsSaving(true);
        try {
            await api.patch(`/lessons/${lessonId}/update-lesson`, {
                ...formData,
                duration: Number(formData.duration) || 5,
                order: Number(formData.order) || 1
            });

            toast.success("Lesson updated successfully!");
            navigate(-1);
        } catch (err) {
            toast.error("Update failed. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-10 h-10 rounded-full border-3 border-brand-border border-t-brand-primary animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest text-brand-muted">
                        Loading Lesson Metadata...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col selection:bg-brand-primary/30">
            <NavBar />
            
            <div className="max-w-2xl mx-auto w-full py-12 px-6 flex-1 flex flex-col justify-center">
                <div className="bg-brand-surface p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-border space-y-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        <button
                            onClick={() => navigate(`/lesson/${lessonId}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                        >
                            <Eye size={14} /> Preview Lesson
                        </button>
                    </div>

                    <header className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                            Edit Lesson
                        </h1>
                        <p className="text-brand-subtle text-xs">
                            Modify title, lesson type, duration, and content details.
                        </p>
                    </header>

                    <form onSubmit={handleUpdate} className="space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Lesson Title *
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Setting Up Redis Architecture"
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted"
                                required
                            />
                        </div>

                        {/* Content Type Selector */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Lesson Format
                            </label>
                            <select
                                name="contentType"
                                value={formData.contentType}
                                onChange={handleChange}
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all capitalize"
                            >
                                <option value="video">Video Lecture (.mp4)</option>
                                <option value="text">Written Article / Documentation</option>
                                <option value="quiz">Interactive Checkpoint</option>
                            </select>
                        </div>

                        {/* Content Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                {formData.contentType === 'video' ? 'Video File Reference / Notes' : 'Lesson Content (Markdown / Text)'}
                            </label>
                            <textarea
                                name="content"
                                rows={4}
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Provide notes or documentation content for this lesson..."
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted resize-none leading-relaxed"
                            />
                        </div>

                        {/* Duration and Order Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                    Duration (Minutes)
                                </label>
                                <input
                                    name="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                    Sequence Order
                                </label>
                                <input
                                    name="order"
                                    type="number"
                                    min="1"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-3 border-t border-brand-border/60">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-brand-muted hover:text-brand-text bg-brand-elevated hover:bg-brand-elevated/80 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-brand-primary hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? "Saving..." : "Update Lesson"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditLesson;
