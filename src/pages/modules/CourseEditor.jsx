import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
    ChevronLeft, 
    Plus, 
    PlayCircle, 
    FileText, 
    ChevronDown, 
    Video, 
    CheckCircle2, 
    GripVertical, 
    Loader2,
    Settings,
    Eye,
    Globe,
    Lock,
    Edit2,
    Check,
    X,
    Clock,
    Sparkles,
    UploadCloud
} from "lucide-react";
import api from "../../api";
import NavBar from "../../components/NavBar";

function CourseEditor() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    
    const [expandedModules, setExpandedModules] = useState({});
    
    // Create Module State
    const [showModuleInput, setShowModuleInput] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [creatingModule, setCreatingModule] = useState(false);

    // Edit Module State (inline editing)
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [editingModuleTitle, setEditingModuleTitle] = useState("");
    const [updatingModule, setUpdatingModule] = useState(false);

    // Create Lesson State
    const [lessonModuleId, setLessonModuleId] = useState(null);
    const [newLesson, setNewLesson] = useState({ title: "", description: "", type: "video", duration: "5" });
    const [lessonFile, setLessonFile] = useState(null);
    const [creatingLesson, setCreatingLesson] = useState(false);
    const fileInputRef = useRef(null);

    const fetchCourseData = async () => {
        try {
            const res = await api.get(`/course/${courseId}/full`);
            const courseData = res.data.course || res.data;
            const moduleList = res.data.modules || [];
            
            setCourse(courseData);
            setModules(moduleList);
            
            // Auto expand first module if not set
            if (moduleList.length > 0 && Object.keys(expandedModules).length === 0) {
                setExpandedModules({ [moduleList[0]._id]: true });
            }
        } catch (err) {
            toast.error("Failed to load curriculum");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePublishToggle = async () => {
        setPublishing(true);
        try {
            const res = await api.patch(`/course/${courseId}/publish`);
            setCourse(prev => prev ? { ...prev, isPublished: res.data.isPublished } : prev);
            toast.success(res.data.isPublished ? "Course is now live in catalog!" : "Course moved to draft mode");
        } catch (err) {
            toast.error("Failed to update publication status");
        } finally {
            setPublishing(false);
        }
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return toast.error("Module title required");
        setCreatingModule(true);
        try {
            await api.post(`/modules/${courseId}/create`, {
                title: newModuleTitle.trim(),
                order: modules.length + 1
            });
            setNewModuleTitle("");
            setShowModuleInput(false);
            await fetchCourseData();
            toast.success("New module added!");
        } catch (err) {
            toast.error("Failed to create module");
        } finally {
            setCreatingModule(false);
        }
    };

    const handleStartEditModule = (e, module) => {
        e.stopPropagation();
        setEditingModuleId(module._id);
        setEditingModuleTitle(module.title);
    };

    const handleSaveModuleTitle = async (e, moduleId, currentOrder) => {
        e.stopPropagation();
        if (!editingModuleTitle.trim()) return toast.error("Title cannot be empty");
        setUpdatingModule(true);
        try {
            await api.patch(`/modules/${moduleId}/update-module`, {
                title: editingModuleTitle.trim(),
                order: currentOrder
            });
            setModules(prev => prev.map(m => m._id === moduleId ? { ...m, title: editingModuleTitle.trim() } : m));
            setEditingModuleId(null);
            toast.success("Module renamed");
        } catch (err) {
            toast.error("Failed to update module");
        } finally {
            setUpdatingModule(false);
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        if (!newLesson.title.trim()) return toast.error("Lesson title required");
        if (newLesson.type === 'video' && !lessonFile) return toast.error("Video file (.mp4 / .webm) required");
        
        setCreatingLesson(true);
        
        try {
            const currentModule = modules.find(m => m._id === lessonModuleId);
            const nextOrder = (currentModule?.lessons?.length || 0) + 1;

            const formData = new FormData();
            formData.append("title", newLesson.title.trim());
            formData.append("description", newLesson.description.trim());
            formData.append("contentType", newLesson.type);
            formData.append("moduleId", lessonModuleId);
            formData.append("order", nextOrder);
            formData.append("duration", Number(newLesson.duration) || 5);
            
            if (newLesson.type === "video") {
                formData.append("lessonFile", lessonFile);
            } else {
                formData.append("content", newLesson.description.trim());
            }

            await api.post("/lessons/create-lesson", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            toast.success("Lesson uploaded & saved!");
            setLessonModuleId(null);
            setNewLesson({ title: "", description: "", type: "video", duration: "5" });
            setLessonFile(null);
            await fetchCourseData();
            
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed. Check file size.");
        } finally {
            setCreatingLesson(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-bg min-h-screen text-brand-text flex flex-col font-sans">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-10 h-10 rounded-full border-3 border-brand-border border-t-brand-primary animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest text-brand-muted">
                        Loading Curriculum Workspace...
                    </p>
                </div>
            </div>
        );
    }

    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text flex flex-col selection:bg-brand-primary/30">
            <NavBar />
            
            {/* Sticky Sub-Header Bar */}
            <div className="bg-brand-surface/90 backdrop-blur-md border-b border-brand-border sticky top-16 z-30 transition-all">
                <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/studio')} 
                            className="p-2 hover:bg-brand-elevated rounded-xl transition-colors text-brand-muted hover:text-brand-text cursor-pointer"
                            title="Back to Studio"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                                    Curriculum Editor
                                </span>
                                <span className="text-brand-border">•</span>
                                <span className="text-xs text-brand-muted">
                                    {modules.length} module{modules.length === 1 ? '' : 's'}, {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
                                </span>
                            </div>
                            <h1 className="text-base sm:text-lg font-bold text-brand-text line-clamp-1">
                                {course?.title || "Course Curriculum"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        {/* Publish/Draft toggle */}
                        <button
                            disabled={publishing}
                            onClick={handlePublishToggle}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                course?.isPublished
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-brand-elevated text-brand-muted border-brand-border hover:text-brand-text hover:border-brand-primary/40"
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${course?.isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-brand-muted'}`} />
                            {course?.isPublished ? "Live in Catalog" : "Draft (Hidden)"}
                        </button>

                        {/* Settings Button */}
                        <button 
                            onClick={() => navigate(`/course/${courseId}/edit`)} 
                            className="p-2 rounded-xl bg-brand-elevated border border-brand-border hover:border-brand-primary/50 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                            title="Edit Course Settings & Thumbnail"
                        >
                            <Settings size={16} />
                        </button>

                        {/* Preview Course */}
                        <button 
                            onClick={() => navigate(`/course/${courseId}`)} 
                            className="px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                            <Eye size={14} />
                            Preview
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 pb-32 space-y-6">
                
                {/* Modules List */}
                <div className="space-y-4">
                    {modules.length === 0 ? (
                        <div className="py-16 px-6 bg-brand-surface border border-dashed border-brand-border rounded-3xl text-center flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-2xl bg-brand-elevated flex items-center justify-center mb-3 text-brand-muted">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-brand-text mb-1">
                                Curriculum is Empty
                            </h3>
                            <p className="text-brand-subtle text-xs max-w-sm mb-6">
                                Start organizing your learning track by creating your first module, then upload video lessons.
                            </p>
                            <button
                                onClick={() => setShowModuleInput(true)}
                                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                            >
                                <Plus size={16} /> Add First Module
                            </button>
                        </div>
                    ) : (
                        modules.sort((a, b) => a.order - b.order).map((module, index) => {
                            const isExpanded = !!expandedModules[module._id];
                            const isEditingTitle = editingModuleId === module._id;

                            return (
                                <div 
                                    key={module._id} 
                                    className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-sm transition-all group/mod hover:border-brand-border/80"
                                >
                                    {/* Module Header Bar */}
                                    <div 
                                        onClick={() => toggleModule(module._id)}
                                        className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-brand-elevated/40 transition-colors select-none"
                                    >
                                        <div className="text-brand-muted hover:text-brand-text cursor-grab">
                                            <GripVertical size={16} />
                                        </div>
                                        <div className="w-7 h-7 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-xs font-mono font-bold text-brand-muted shrink-0">
                                            {index + 1}
                                        </div>

                                        {/* Inline Title Edit vs Display */}
                                        {isEditingTitle ? (
                                            <div 
                                                onClick={e => e.stopPropagation()} 
                                                className="flex-1 flex items-center gap-2"
                                            >
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editingModuleTitle}
                                                    onChange={e => setEditingModuleTitle(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSaveModuleTitle(e, module._id, module.order)}
                                                    className="flex-1 bg-brand-elevated border border-brand-primary rounded-lg px-3 py-1.5 text-sm font-bold text-brand-text focus:outline-none"
                                                />
                                                <button
                                                    disabled={updatingModule}
                                                    onClick={(e) => handleSaveModuleTitle(e, module._id, module.order)}
                                                    className="p-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors cursor-pointer"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingModuleId(null); }}
                                                    className="p-1.5 bg-brand-elevated text-brand-muted hover:text-brand-text rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center gap-3 min-w-0">
                                                <h3 className="font-bold text-sm sm:text-base text-brand-text truncate">
                                                    {module.title}
                                                </h3>
                                                <span className="text-[11px] font-mono text-brand-subtle shrink-0">
                                                    ({module.lessons?.length || 0} lesson{module.lessons?.length === 1 ? '' : 's'})
                                                </span>
                                            </div>
                                        )}

                                        {/* Module Header Controls */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={(e) => handleStartEditModule(e, module)}
                                                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-elevated transition-colors cursor-pointer opacity-0 group-hover/mod:opacity-100"
                                                title="Rename Module"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <div className="p-1 text-brand-muted">
                                                <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Module Lessons Container */}
                                    {isExpanded && (
                                        <div className="border-t border-brand-border bg-brand-bg/40 p-3 sm:p-4 space-y-2">
                                            {(!module.lessons || module.lessons.length === 0) ? (
                                                <div className="p-6 text-center text-brand-subtle text-xs bg-brand-surface/40 rounded-xl border border-dashed border-brand-border">
                                                    No lessons added to this module yet.
                                                </div>
                                            ) : (
                                                module.lessons.sort((a, b) => a.order - b.order).map((lesson, lIdx) => (
                                                    <div 
                                                        key={lesson._id} 
                                                        className="flex items-center gap-3 p-3 bg-brand-surface border border-brand-border/60 hover:border-brand-primary/40 rounded-xl transition-all group/lesson shadow-sm"
                                                    >
                                                        <div className="text-brand-border group-hover/lesson:text-brand-muted cursor-grab">
                                                            <GripVertical size={14} />
                                                        </div>
                                                        <div className="w-7 h-7 rounded-lg bg-brand-elevated text-brand-primary flex items-center justify-center shrink-0">
                                                            {lesson.contentType === 'video' ? <PlayCircle size={15} /> : <FileText size={15} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-mono text-brand-muted">
                                                                    {index + 1}.{lIdx + 1}
                                                                </span>
                                                                <span className="text-xs sm:text-sm font-semibold text-brand-text truncate">
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                            {lesson.description && (
                                                                <p className="text-[11px] text-brand-subtle line-clamp-1 mt-0.5">
                                                                    {lesson.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Duration Badge */}
                                                        <span className="text-[11px] text-brand-muted font-mono bg-brand-elevated px-2 py-0.5 rounded border border-brand-border shrink-0 flex items-center gap-1">
                                                            <Clock size={11} />
                                                            {lesson.duration || "5"}m
                                                        </span>

                                                        {/* Lesson Action Buttons */}
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={() => navigate(`/edit-lesson/${lesson._id}`)}
                                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-elevated transition-colors cursor-pointer"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/lesson/${lesson._id}`)}
                                                                className="p-1 rounded-lg text-brand-muted hover:text-brand-primary transition-colors cursor-pointer"
                                                                title="Preview Lesson Player"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {/* Add Lesson Form or Trigger */}
                                            {lessonModuleId === module._id ? (
                                                <div className="p-4 sm:p-5 bg-brand-surface border border-brand-primary/40 rounded-xl shadow-lg mt-3">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                                                            <Video size={15} /> Add Video Lesson to Module {index + 1}
                                                        </h4>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setLessonModuleId(null)}
                                                            className="text-brand-muted hover:text-brand-text p-1 cursor-pointer"
                                                        >
                                                            <X size={15} />
                                                        </button>
                                                    </div>

                                                    <form onSubmit={handleCreateLesson} className="space-y-4">
                                                        <div>
                                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                                                                Lesson Title *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Setting Up Redis Cache Clustered Architecture"
                                                                value={newLesson.title}
                                                                onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                                                                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary text-brand-text placeholder-brand-muted"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                                                                Lesson Notes & Outline
                                                            </label>
                                                            <textarea
                                                                placeholder="Summary of concepts covered in this lesson..."
                                                                value={newLesson.description}
                                                                onChange={e => setNewLesson({...newLesson, description: e.target.value})}
                                                                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary text-brand-text placeholder-brand-muted resize-none h-20"
                                                            />
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {/* Video File Picker */}
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                                                                    Video Asset (.mp4 / .webm) *
                                                                </label>
                                                                <input 
                                                                    type="file" 
                                                                    ref={fileInputRef}
                                                                    accept="video/mp4,video/webm"
                                                                    onChange={e => setLessonFile(e.target.files[0])}
                                                                    className="hidden" 
                                                                />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-brand-border hover:border-brand-primary text-brand-muted hover:text-brand-text py-2.5 px-3 rounded-xl transition-colors text-xs font-medium cursor-pointer bg-brand-elevated/40"
                                                                >
                                                                    <UploadCloud size={16} />
                                                                    <span className="truncate">
                                                                        {lessonFile ? lessonFile.name : "Choose Video File"}
                                                                    </span>
                                                                </button>
                                                            </div>

                                                            {/* Estimated Duration */}
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                                                                    Estimated Duration (Minutes)
                                                                </label>
                                                                <div className="relative">
                                                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={newLesson.duration}
                                                                        onChange={e => setNewLesson({...newLesson, duration: e.target.value})}
                                                                        className="w-full bg-brand-elevated border border-brand-border rounded-xl py-2.5 pl-8 pr-3 text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-primary text-brand-text"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-2.5 pt-2 border-t border-brand-border/60">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setLessonModuleId(null)} 
                                                                className="px-4 py-2 text-xs font-bold text-brand-muted hover:text-brand-text cursor-pointer"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                type="submit" 
                                                                disabled={creatingLesson}
                                                                className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                                                            >
                                                                {creatingLesson ? (
                                                                    <>
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                        Uploading Lesson...
                                                                    </>
                                                                ) : (
                                                                    "Upload & Save Lesson"
                                                                )}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setLessonModuleId(module._id)}
                                                    className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 rounded-xl transition-colors border border-brand-primary/20 cursor-pointer"
                                                >
                                                    <Plus size={14} /> Add Lesson to {module.title}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Add Module Block */}
                <div className="pt-2">
                    {showModuleInput ? (
                        <div className="bg-brand-surface border border-brand-primary/40 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-brand-text flex items-center gap-2">
                                    <Plus size={16} className="text-brand-primary" /> Create New Module
                                </h4>
                                <button 
                                    onClick={() => setShowModuleInput(false)}
                                    className="text-brand-muted hover:text-brand-text p-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Distributed Caching & Message Queues"
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateModule()}
                                    className="flex-1 bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-brand-text placeholder-brand-muted"
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleCreateModule}
                                        disabled={creatingModule}
                                        className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                                    >
                                        {creatingModule ? <Loader2 size={16} className="animate-spin" /> : "Save Module"}
                                    </button>
                                    <button 
                                        onClick={() => setShowModuleInput(false)} 
                                        className="px-4 py-3 text-brand-muted hover:text-brand-text font-bold text-sm cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowModuleInput(true)}
                            className="w-full py-5 border-2 border-dashed border-brand-border hover:border-brand-primary text-brand-muted hover:text-brand-primary rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-brand-surface/30 hover:bg-brand-surface"
                        >
                            <Plus size={18} /> Add New Curriculum Module
                        </button>
                    )}
                </div>

            </main>
        </div>
    );
}

export default CourseEditor;
