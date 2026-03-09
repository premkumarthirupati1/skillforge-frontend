import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import { toast } from "react-hot-toast"; // For professional feedback

function CreateCourse() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        tags: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Client-side Validation
        if (formData.title.trim().length < 5) {
            return toast.error("Title must be at least 5 characters");
        }

        setIsSubmitting(true);
        try {
            const tagsArray = formData.tags
                .split(",")
                .map(tag => tag.trim())
                .filter(tag => tag !== ""); // Remove empty tags

            const res = await api.post("/course/create-course", {
                ...formData,
                tags: tagsArray
            });

            toast.success("Course shell created! Heading to builder...");
            navigate(`/course-builder/${res.data.course._id}`);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to create course";
            toast.error(errorMsg);
            console.error("Course Creation Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <NavBar />
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <header className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900">Create New Course</h2>
                        <p className="text-slate-500 mt-2">Set up the basic details of your learning path.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Course Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Course Title *</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Advanced React Patterns"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="What will students learn in this course?"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Difficulty & Tags Grid */}
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
                                    type="text"
                                    name="tags"
                                    placeholder="React, Frontend, Web"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isSubmitting
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
                                }`}
                        >
                            {isSubmitting ? "Generating Course..." : "Create Course & Start Building"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateCourse;