import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
import { toast } from "react-hot-toast";

function CreateCourse() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(null); // For live image preview
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        difficulty: "beginner",
        tags: "",
        thumbnail: null // Change from thumbnailPath to null (for File object)
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "thumbnail") {
            const file = files[0];
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setPreview(URL.createObjectURL(file)); // Generate preview URL
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.title.trim().length < 5) {
            return toast.error("Title must be at least 5 characters");
        }

        setIsSubmitting(true);

        // Use FormData for Multer compatibility
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("difficulty", formData.difficulty);
        data.append("price", formData.price);
        const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t !== "");
        data.append("tags", JSON.stringify(tagsArray)); // Send tags as stringified array

        if (formData.thumbnail) {
            data.append("thumbnail", formData.thumbnail); // 'thumbnail' must match upload.single('thumbnail')
        }

        try {
            const res = await api.post("/course/create-course", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Course created with thumbnail!");
            navigate(`/studio/course/${res.data.course._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            <NavBar />
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <header className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create New Course</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Set up the basic details of your learning path.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Thumbnail Upload & Preview */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Course Thumbnail</label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-4" />
                                ) : (
                                    <div className="text-slate-400 dark:text-slate-500 py-8 text-sm">No image selected</div>
                                )}
                                <input
                                    type="file"
                                    name="thumbnail"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Course Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Course Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Master Full-Stack Web Development"
                                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a brief summary of what students will learn..."
                                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Price ($) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    placeholder="React, Frontend, JavaScript"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                                isSubmitting ? "bg-slate-400 dark:bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25"
                            }`}
                        >
                            {isSubmitting ? "Generating..." : "Create Course & Start Building"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateCourse;