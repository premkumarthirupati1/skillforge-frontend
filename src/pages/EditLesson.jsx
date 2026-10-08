import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast";

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
                duration: duration || "",
                order: order || ""
            });
        } catch (err) {
            toast.error("Failed to load lesson details");
            console.error(err);
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

        // Validation check
        if (!formData.title.trim()) return toast.error("Title is required");

        setIsSaving(true);
        try {
            await api.patch(`/lessons/${lessonId}/update-lesson`, {
                ...formData,
                duration: Number(formData.duration),
                order: Number(formData.order)
            });

            toast.success("Lesson updated!");
            navigate(-1); // Returns to the previous builder view
        } catch (err) {
            toast.error("Update failed. Please try again.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <NavBar />
            <div className="flex justify-center mt-20 text-slate-400 animate-pulse">
                Fetching lesson data...
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            <NavBar />
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <header className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Edit Lesson</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Modify your content for this lesson.</p>
                    </header>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Lesson Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Content Type Selector */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Content Type</label>
                            <select
                                name="contentType"
                                value={formData.contentType}
                                onChange={handleChange}
                                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="video">🎥 Video</option>
                                <option value="text">📄 Text</option>
                                <option value="quiz">❓ Quiz</option>
                            </select>
                        </div>

                        {/* Content Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                {formData.contentType === 'video' ? 'Video URL / Source' : 'Content Details'}
                            </label>
                            <textarea
                                name="content"
                                rows="4"
                                value={formData.content}
                                onChange={handleChange}
                                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Duration and Order Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Duration (min)</label>
                                <input
                                    name="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Sequence Order</label>
                                <input
                                    name="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                                    isSaving ? "bg-slate-400 dark:bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25"
                                }`}
                            >
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
