import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast"; // For better UX feedback

function EditCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        tags: ""
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/course/${courseId}/full`);
                const course = res.data.course;
                setFormData({
                    title: course.title,
                    description: course.description,
                    difficulty: course.difficulty,
                    tags: course.tags.join(", ") // Added space for readability
                });
            } catch (err) {
                toast.error("Failed to load course data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map(t => t.trim())
                .filter(t => t !== ""); // Clean up empty tags

            await api.patch(`/course/${courseId}/update-course`, {
                ...formData,
                tags: tagsArray
            });

            toast.success("Course updated successfully");
            navigate("/instructor");
        } catch (err) {
            toast.error("Error updating course");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <NavBar />
            <div className="flex justify-center mt-20 text-slate-500 animate-pulse">
                Loading course details...
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <NavBar />
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <header className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900">Edit Course Details</h2>
                        <p className="text-slate-500 mt-2">Update the core information for your learning path.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Course Title"
                                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Describe the course..."
                                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma separated)</label>
                                <input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="React, Backend, SQL"
                                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/instructor")}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isSaving ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditCourse;