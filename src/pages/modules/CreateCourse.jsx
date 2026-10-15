import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
    ChevronLeft, 
    UploadCloud, 
    Image as ImageIcon, 
    X, 
    DollarSign, 
    Sparkles, 
    BookOpen, 
    Tag, 
    BarChart3,
    CheckCircle2,
    Loader2
} from "lucide-react";
import NavBar from "../../components/NavBar";
import api from "../../api";

const DIFFICULTY_OPTIONS = [
    { value: "beginner", label: "Beginner", desc: "No prior experience required" },
    { value: "intermediate", label: "Intermediate", desc: "Foundational coding knowledge needed" },
    { value: "advanced", label: "Advanced", desc: "Deep technical & architecture depth" }
];

function CreateCourse() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [tagsList, setTagsList] = useState(["Web Dev", "Full Stack"]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        difficulty: "beginner",
        thumbnail: null
    });

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

    const removeThumbnail = () => {
        setFormData(prev => ({ ...prev, thumbnail: null }));
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.title.trim().length < 5) {
            return toast.error("Course title must be at least 5 characters long");
        }
        if (!formData.description.trim()) {
            return toast.error("Please provide a course description");
        }

        setIsSubmitting(true);

        const data = new FormData();
        data.append("title", formData.title.trim());
        data.append("description", formData.description.trim());
        data.append("difficulty", formData.difficulty);
        data.append("price", Number(formData.price) || 0);
        data.append("tags", JSON.stringify(tagsList));

        if (formData.thumbnail) {
            data.append("thumbnail", formData.thumbnail);
        }

        try {
            const res = await api.post("/course/create-course", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Course blueprint created!");
            const courseId = res.data?.result?.course?._id || res.data?.course?._id || res.data?.result?._id;
            if (courseId) {
                navigate(`/studio/course/${courseId}`);
            } else {
                navigate('/studio');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col selection:bg-brand-primary/30">
            <NavBar />

            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-24 left-1/4 w-[500px] h-[400px] bg-brand-primary/5 blur-[140px] rounded-full" />
                <div className="absolute top-96 right-1/4 w-[450px] h-[350px] bg-brand-primary/3 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 sm:py-12 relative z-10 space-y-8">
                
                {/* Breadcrumbs & Header */}
                <div className="space-y-2">
                    <button
                        onClick={() => navigate('/studio')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors cursor-pointer mb-2"
                    >
                        <ChevronLeft size={16} />
                        Back to Creator Studio
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
                        Create New Course
                    </h1>
                    <p className="text-brand-subtle text-sm">
                        Set up your course metadata. You can add interactive modules and upload lessons in the next step.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Thumbnail Upload Dropzone */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Course Cover Thumbnail
                            </label>
                            
                            {preview ? (
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-brand-border bg-brand-elevated group">
                                    <img 
                                        src={preview} 
                                        alt="Cover preview" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={removeThumbnail}
                                            className="px-4 py-2 rounded-xl bg-red-500/90 text-white font-bold text-xs flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                                        >
                                            <X size={14} /> Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed border-brand-border hover:border-brand-primary/60 rounded-2xl bg-brand-elevated/40 hover:bg-brand-elevated/80 transition-all cursor-pointer p-6 text-center group">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted group-hover:text-brand-primary group-hover:border-brand-primary/40 transition-colors mb-3 shadow-sm">
                                        <UploadCloud size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-brand-text mb-1">
                                        Click to upload course thumbnail
                                    </span>
                                    <span className="text-xs text-brand-subtle">
                                        Recommended 16:9 ratio (1280x720) • PNG or JPG up to 5MB
                                    </span>
                                    <input
                                        type="file"
                                        name="thumbnail"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
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
                                placeholder="e.g., Master Production Full-Stack Development with Node.js & React"
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted"
                                required
                            />
                        </div>

                        {/* Course Description */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Course Summary & Goals <span className="text-brand-primary">*</span>
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe what students will build and master throughout this track..."
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted resize-none leading-relaxed"
                                required
                            />
                        </div>

                        {/* Price & Difficulty Grid */}
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
                                        placeholder="0 for free"
                                        className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted font-mono"
                                    />
                                </div>
                                <p className="text-[11px] text-brand-subtle mt-1.5 font-medium">
                                    Set to $0 to make this course freely accessible to all learners.
                                </p>
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
                                    <option value="beginner">Beginner (No prerequisites)</option>
                                    <option value="intermediate">Intermediate (Hands-on experience)</option>
                                    <option value="advanced">Advanced (Production architecture)</option>
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
                                    placeholder="Type a tag and press Enter (e.g. React, Cloud, Python)..."
                                    className="w-full bg-transparent text-sm text-brand-text placeholder-brand-muted focus:outline-none"
                                />
                            </div>
                            <p className="text-[11px] text-brand-subtle mt-1.5">
                                Press Enter or comma to add tags. Helps students discover your curriculum.
                            </p>
                        </div>

                        {/* Action Buttons */}
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
                                disabled={isSubmitting}
                                className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Creating Blueprint...
                                    </>
                                ) : (
                                    <>
                                        <span>Create & Open Curriculum</span>
                                        <span>&rarr;</span>
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

export default CreateCourse;
