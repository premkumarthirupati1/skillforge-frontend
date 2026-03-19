import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast";

function EditCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        tags: "",
        price: 0,
        thumbnail: null
    });

    const [currentThumbnail, setCurrentThumbnail] = useState("");
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/course/${courseId}/full`);
                const { course } = res.data;
                let processedTags = course.tags;
                if (Array.isArray(processedTags) && typeof processedTags[0] === 'string' && processedTags[0].startsWith('[')) {
                    try { processedTags = JSON.parse(processedTags[0]); } catch (e) { }
                }

                setFormData({
                    title: course.title,
                    description: course.description,
                    difficulty: course.difficulty,
                    tags: Array.isArray(processedTags) ? processedTags.join(", ") : "",
                    price: course.price,
                    thumbnail: null
                });
                setCurrentThumbnail(course.thumbnail);
            } catch (err) {
                toast.error("Failed to load course");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "thumbnail") {
            const file = files[0];
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setPreview(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("difficulty", formData.difficulty);
        data.append("price", formData.price);
        // Convert string "Node, Express" -> ["Node", "Express"]
        const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t !== "");

        // Crucial: Append as a JSON string for the Backend to parse once
        data.append("tags", JSON.stringify(tagsArray));

        if (formData.thumbnail instanceof File) {
            data.append("thumbnail", formData.thumbnail);
        }

        try {
            await api.patch(`/course/${courseId}/update-course`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Updated!");
            navigate("/instructor");
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading course...</div>;

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <NavBar />
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <header className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900">Edit Course</h2>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Thumbnail Edit Section */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
                            <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                <img
                                    src={preview || `http://localhost:3000/${currentThumbnail}`}
                                    alt="Course Thumbnail"
                                    className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm"
                                />
                                <input
                                    type="file"
                                    name="thumbnail"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Price</label>
                            <input name="price  " value={formData.price} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tags</label>
                                <input name="tags" value={formData.tags} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => navigate("/instructor")} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                            <button type="submit" disabled={isSaving} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${isSaving ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
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