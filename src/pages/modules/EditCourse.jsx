import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
    ChevronLeft, 
    UploadCloud, 
    X, 
    DollarSign, 
    Layers, 
    Settings, 
    Save, 
    Loader2,
    Eye,
    Tag
} from "lucide-react";
import api from "../../api";
import NavBar from "../../components/NavBar";
import { getImageUrl } from "../../utils/imageHelper";

function EditCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [tagsList, setTagsList] = useState([]);
    const [currentThumbnail, setCurrentThumbnail] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        price: 0,
        thumbnail: null
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/course/${courseId}/full`);
                const { course } = res.data;
                
                let processedTags = course.tags;
                if (Array.isArray(processedTags) && typeof processedTags[0] === 'string' && processedTags[0].startsWith('[')) {
                    try { 
                        processedTags = JSON.parse(processedTags[0]); 
                    } catch (e) {
                        // fallback to as-is
                    }
                }
                const parsedTags = Array.isArray(processedTags) 
                    ? processedTags.map(t => String(t).trim()).filter(Boolean)
                    : [];

                setFormData({
                    title: course.title || "",
                    description: course.description || "",
                    difficulty: course.difficulty || "beginner",
                    price: course.price || 0,
                    thumbnail: null
                });
                setTagsList(parsedTags);
                setCurrentThumbnail(course.thumbnail || "");
            } catch (err) {
                toast.error("Failed to load course details");
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
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    return toast.error("Image file must be under 5MB");
                }
                setFormData(prev => ({ ...prev, thumbnail: file }));
                setPreview(URL.createObjectURL(file));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddTag = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^,|,$/g, "");
            if (trimmed && !tagsList.includes(trimmed)) {
                if (tagsList.length >= 8) {
                    return toast.error("Maximum 8 tags allowed");
                }
                setTagsList(prev => [...prev, trimmed]);
                setTagInput("");
            }
        }
    };

    const removeTag = (indexToRemove) => {
        setTagsList(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.title.trim().length < 5) {
            return toast.error("Course title must be at least 5 characters long");
        }

        setIsSaving(true);

        const data = new FormData();
        data.append("title", formData.title.trim());
        data.append("description", formData.description.trim());
        data.append("difficulty", formData.difficulty);
        data.append("price", Number(formData.price) || 0);
        data.append("tags", JSON.stringify(tagsList));

        if (formData.thumbnail instanceof File) {
            data.append("thumbnail", formData.thumbnail);
        }

        try {
            await api.patch(`/course/${courseId}/update-course`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Course settings saved!");
            navigate("/studio");
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
                        Loading Course Details...
                    </p>
                </div>
            </div>
        );
    }

    const currentImageSrc = preview || getImageUrl(currentThumbnail);

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col selection:bg-brand-primary/30">
            <NavBar />

            {/* Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-24 left-1/4 w-[500px] h-[400px] bg-brand-primary/5 blur-[140px] rounded-full" />
                <div className="absolute top-96 right-1/4 w-[450px] h-[350px] bg-brand-primary/3 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 sm:py-12 relative z-10 space-y-8">
                
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/60">
                    <div className="space-y-1">
                        <button
                            onClick={() => navigate('/studio')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors cursor-pointer mb-1"
                        >
                            <ChevronLeft size={16} />
                            Back to Creator Studio
                        </button>
                        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
                            Course Settings
                        </h1>
                        <p className="text-brand-subtle text-sm">
                            Update course title, cover image, pricing, and tags.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/studio/course/${courseId}`)}
                            className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-text text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                        >
                            <Layers size={14} className="text-brand-primary" />
                            Curriculum Builder
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/course/${courseId}`)}
                            className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                            title="Preview Public Page"
                        >
                            <Eye size={16} />
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Thumbnail Edit Section */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Course Cover Thumbnail
                            </label>
                            
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-brand-border bg-brand-elevated group">
                                {currentImageSrc ? (
                                    <img
                                        src={currentImageSrc}
                                        alt="Course Thumbnail"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-brand-muted p-4">
                                        <UploadCloud size={32} className="mb-2" />
                                        <span className="text-xs">No thumbnail uploaded</span>
                                    </div>
                                )}

                                {/* Overlay for change */}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer text-white">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg">
                                        <UploadCloud size={20} />
                                    </div>
                                    <span className="text-xs font-bold">Click to replace thumbnail</span>
                                    <span className="text-[10px] text-brand-subtle">PNG, JPG, or WEBP under 5MB</span>
                                    <input
                                        type="file"
                                        name="thumbnail"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Course Title */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                    Course Title <span className="text-brand-primary">*</span>
                                </label>
                                <span className="text-[11px] font-mono text-brand-subtle">
                                    {formData.title.length}/100
                                </span>
                            </div>
                            <input
                                type="text"
                                name="title"
                                maxLength={100}
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Course Summary & Goals
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted resize-none leading-relaxed"
                                required
                            />
                        </div>

                        {/* Price & Difficulty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Price */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                    Price (USD)
                                </label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="1"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                    Target Level
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all capitalize"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        {/* Tags Pill Management */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Category & Skill Tags
                            </label>
                            <div className="bg-brand-elevated border border-brand-border rounded-xl p-3 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tagsList.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-surface border border-brand-border text-brand-text px-2.5 py-1 rounded-lg"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(idx)}
                                                className="text-brand-muted hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Type a tag and press Enter..."
                                    className="w-full bg-transparent text-sm text-brand-text placeholder-brand-muted focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                            <button
                                type="button"
                                onClick={() => navigate('/studio')}
                                className="px-5 py-3 rounded-xl border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text hover:bg-brand-elevated text-sm font-bold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default EditCourse;
