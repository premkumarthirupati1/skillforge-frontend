import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ChevronLeft, Video, FileText, Clock, UploadCloud, Loader2, Plus } from "lucide-react";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { extractVideoDuration } from "../../utils/videoHelper";

function LessonBuilder() {
    const navigate = useNavigate();
    const { moduleId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [extractedDuration, setExtractedDuration] = useState(null);
    const [extractingDuration, setExtractingDuration] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        contentType: "video",
        content: "",
        duration: "5",
        order: "",
        lessonFile: null
    });

    const fetchLessons = useCallback(async () => {
        try {
            const res = await api.get(`/lessons/${moduleId}`);
            setLessons(res.data);
        } catch (err) {
            toast.error("Failed to load lessons");
        } finally {
            setLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    const handleChange = async (e) => {
        const { name, value, files } = e.target;
        if (name === "lessonFile") {
            const file = files[0];
            if (!file) return;
            setFormData(prev => ({ ...prev, lessonFile: file }));
            setExtractingDuration(true);
            try {
                const info = await extractVideoDuration(file);
                setExtractedDuration(info);
                setFormData(prev => ({ ...prev, duration: String(info.minutes) }));
                toast.success(`Video duration extracted: ${info.formatted} (${info.minutes}m)`);
            } catch (err) {
                setExtractedDuration({ minutes: 5, formatted: "5:00" });
            } finally {
                setExtractingDuration(false);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) return "Title is required";
        if (formData.contentType === "video" && !formData.lessonFile) return "Video file is required";
        if (formData.contentType !== "video" && !formData.content.trim()) return "Content is required";
        return null;
    };

    const createLesson = async () => {
        const error = validateForm();
        if (error) return toast.error(error);

        setIsSubmitting(true);

        const finalDuration = extractedDuration?.minutes || Number(formData.duration) || 5;

        const data = new FormData();
        data.append("title", formData.title.trim());
        data.append("contentType", formData.contentType);
        data.append("duration", finalDuration);
        data.append("order", Number(formData.order) || lessons.length + 1);
        data.append("moduleId", moduleId);
        if (formData.contentType === "video") {
            data.append("lessonFile", formData.lessonFile);
        } else {
            data.append("content", formData.content);
        }

        try {
            await api.post("/lessons/create-lesson", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Lesson uploaded & saved!");
            setFormData({
                title: "",
                contentType: "video",
                content: "",
                duration: "5",
                order: "",
                lessonFile: null
            });
            setExtractedDuration(null);
            fetchLessons();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create lesson");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col selection:bg-brand-primary/30">
            <NavBar />
            <div className="max-w-4xl mx-auto py-12 px-6 w-full flex-1 space-y-8">
                <header className="flex justify-between items-center pb-4 border-b border-brand-border/60">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors cursor-pointer mb-2"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h1 className="text-3xl font-black text-brand-text tracking-tight">Lesson Manager</h1>
                        <p className="text-brand-subtle text-xs mt-1">Upload lessons and organize curriculum order.</p>
                    </div>
                </header>

                {/* Existing Lessons List */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">Current Lessons</h3>
                    {loading ? (
                        <div className="text-center py-8 text-brand-muted text-xs animate-pulse">Loading lessons...</div>
                    ) : lessons.length > 0 ? (
                        lessons.map((lesson) => (
                            <div key={lesson._id} className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <span className="bg-brand-elevated text-brand-muted px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-brand-border">{lesson.order}</span>
                                    <div>
                                        <p className="font-bold text-sm text-brand-text">{lesson.title}</p>
                                        <p className="text-[11px] text-brand-subtle uppercase tracking-wider">{lesson.contentType} • {lesson.duration}m</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/edit-lesson/${lesson._id}`)} className="text-brand-primary font-bold text-xs hover:underline cursor-pointer">Edit</button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-brand-surface rounded-2xl border border-dashed border-brand-border text-brand-subtle text-xs">No lessons found in this module.</div>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-brand-surface p-6 sm:p-8 rounded-3xl border border-brand-border space-y-5 shadow-xl">
                    <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        <Plus size={18} className="text-brand-primary" /> Add New Lesson
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="title"
                            placeholder="Lesson Title *"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary"
                        />
                        <select
                            name="contentType"
                            value={formData.contentType}
                            onChange={handleChange}
                            className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary"
                        >
                            <option value="video">🎥 Video Lesson</option>
                            <option value="text">📄 Text / Article</option>
                        </select>
                    </div>

                    {formData.contentType === "video" ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Upload Video File</label>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-border hover:border-brand-primary p-6 rounded-2xl bg-brand-elevated/40 hover:bg-brand-elevated/70 text-center cursor-pointer transition-all">
                                    <UploadCloud size={24} className="text-brand-muted mb-2" />
                                    <span className="text-xs font-bold text-brand-text">{formData.lessonFile ? formData.lessonFile.name : "Click to select video (.mp4, .webm)"}</span>
                                    <span className="text-[10px] text-brand-subtle mt-1">Timeline duration will be automatically extracted</span>
                                    <input
                                        type="file"
                                        name="lessonFile"
                                        accept="video/mp4,video/webm,video/quicktime"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Auto Timeline Duration Status */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center justify-between">
                                    <span>Timeline Duration</span>
                                    <span className="text-[10px] text-brand-primary font-normal">auto-extracted</span>
                                </label>
                                <div className="h-[42px] px-3.5 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between text-xs">
                                    {extractingDuration ? (
                                        <div className="flex items-center gap-2 text-brand-primary">
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Extracting video timeline...</span>
                                        </div>
                                    ) : extractedDuration ? (
                                        <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="font-mono font-bold text-brand-text">{extractedDuration.formatted}</span>
                                            <span className="text-[11px] text-brand-subtle">({extractedDuration.minutes} min)</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-brand-subtle text-xs">
                                            <Clock size={13} className="text-brand-muted" />
                                            <span>Automatically extracted from video timeline</span>
                                        </div>
                                    )}
                                    <span className="text-[10px] uppercase font-bold text-brand-muted bg-brand-surface px-2 py-0.5 rounded border border-brand-border/60">
                                        Timeline
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            name="content"
                            placeholder="Write your lesson content or documentation here..."
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary h-32 resize-none"
                        />
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Sequence Order (Optional)</label>
                        <input
                            name="order"
                            type="number"
                            min="1"
                            placeholder="Order sequence (e.g. 1)"
                            value={formData.order}
                            onChange={handleChange}
                            className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary font-mono"
                        />
                    </div>

                    <button
                        onClick={createLesson}
                        disabled={isSubmitting || extractingDuration}
                        className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Uploading Lesson...
                            </>
                        ) : (
                            "Add Lesson to Module"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LessonBuilder;
