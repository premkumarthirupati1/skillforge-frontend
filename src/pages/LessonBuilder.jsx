import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast";

function LessonBuilder() {
    const navigate = useNavigate();
    const { moduleId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        contentType: "video",
        content: "",
        duration: "",
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

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "lessonFile") {
            setFormData(prev => ({ ...prev, lessonFile: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) return "Title is required";
        if (formData.contentType === "video" && !formData.lessonFile) return "Video file is required";
        if (formData.contentType !== "video" && !formData.content.trim()) return "Content is required";
        if (!formData.duration || formData.duration <= 0) return "Provide a valid duration";
        return null;
    };

    const createLesson = async () => {
        const error = validateForm();
        if (error) return toast.error(error);

        setIsSubmitting(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("contentType", formData.contentType);
        data.append("duration", Number(formData.duration));
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

            toast.success("Lesson uploaded successfully!");
            fetchLessons();
            setFormData({
                title: "",
                contentType: "video",
                content: "",
                duration: "",
                order: "",
                lessonFile: null
            });
        } catch (err) {
            toast.error("Error uploading lesson");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading lessons...</div>;

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <NavBar />
            <div className="max-w-4xl mx-auto py-12 px-6">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Lesson Builder</h1>
                        <p className="text-slate-500">Upload videos or add text content.</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-600 hover:text-indigo-600">
                        &larr; Back to Modules
                    </button>
                </header>

                <div className="space-y-3 mb-12">
                    {lessons.length > 0 ? (
                        lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                            <div key={lesson._id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex justify-between items-center hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">{lesson.order}</span>
                                    <div>
                                        <p className="font-bold text-slate-800">{lesson.title}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-tighter">{lesson.contentType} • {lesson.duration} mins</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/edit-lesson/${lesson._id}`)} className="text-indigo-600 font-bold text-sm hover:underline">Edit</button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">No lessons found.</div>
                    )}
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-5">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Create New Lesson</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="title" placeholder="Lesson Title" value={formData.title} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        <select name="contentType" value={formData.contentType} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                            <option value="video">🎥 Video Lesson</option>
                            <option value="text">📄 Text Content</option>
                        </select>
                    </div>

                    {formData.contentType === "video" ? (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Upload Video File</label>
                            <input
                                type="file"
                                name="lessonFile"
                                accept="video/*"
                                onChange={handleChange}
                                className="w-full border border-dashed border-slate-300 p-8 rounded-xl bg-slate-50 text-center cursor-pointer hover:bg-slate-100 transition-all"
                            />
                        </div>
                    ) : (
                        <textarea name="content" placeholder="Write your lesson content here..." value={formData.content} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-32" />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <input name="duration" type="number" placeholder="Duration (mins)" value={formData.duration} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        <input name="order" type="number" placeholder="Order (Optional)" value={formData.order} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>

                    <button onClick={createLesson} disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:bg-slate-300">
                        {isSubmitting ? "Uploading..." : "Add Lesson to Module"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LessonBuilder;