import { useEffect, useState, useRef } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ChevronLeft, Plus, PlayCircle, FileText, ChevronDown, Video, CheckCircle, GripVertical, Loader2 } from "lucide-react";

function CourseEditor() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [expandedModules, setExpandedModules] = useState({});
    
    // Create Module State
    const [showModuleInput, setShowModuleInput] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [creatingModule, setCreatingModule] = useState(false);

    // Create Lesson State
    const [lessonModuleId, setLessonModuleId] = useState(null); // Which module is getting a new lesson
    const [newLesson, setNewLesson] = useState({ title: "", description: "", type: "video" });
    const [lessonFile, setLessonFile] = useState(null);
    const [creatingLesson, setCreatingLesson] = useState(false);
    const fileInputRef = useRef(null);

    const fetchCourseData = async () => {
        try {
            const res = await api.get(`/course/${courseId}/full`);
            setCourse(res.data.course || res.data);
            setModules(res.data.modules || []);
            
            // Auto expand first module
            if (res.data.modules?.length > 0 && Object.keys(expandedModules).length === 0) {
                setExpandedModules({ [res.data.modules[0]._id]: true });
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

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return toast.error("Title required");
        setCreatingModule(true);
        try {
            await api.post(`/modules/${courseId}/create`, {
                title: newModuleTitle,
                order: modules.length + 1
            });
            setNewModuleTitle("");
            setShowModuleInput(false);
            fetchCourseData();
            toast.success("Module added");
        } catch (err) {
            toast.error("Failed to create module");
        } finally {
            setCreatingModule(false);
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        if (!newLesson.title.trim()) return toast.error("Lesson title required");
        if (newLesson.type === 'video' && !lessonFile) return toast.error("Video file required");
        
        setCreatingLesson(true);
        
        try {
            const currentModule = modules.find(m => m._id === lessonModuleId);
            const nextOrder = (currentModule?.lessons?.length || 0) + 1;

            const formData = new FormData();
            formData.append("title", newLesson.title);
            formData.append("description", newLesson.description);
            formData.append("contentType", newLesson.type);
            formData.append("moduleId", lessonModuleId);
            formData.append("order", nextOrder);
            formData.append("duration", "5"); // default mock duration
            
            if (newLesson.type === "video") {
                formData.append("lessonFile", lessonFile);
            } else {
                formData.append("content", newLesson.description);
            }

            await api.post("/lessons/create-lesson", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            toast.success("Lesson uploaded!");
            setLessonModuleId(null);
            setNewLesson({ title: "", description: "", type: "video" });
            setLessonFile(null);
            fetchCourseData();
            
        } catch (err) {
            toast.error("Upload failed");
            console.error(err);
        } finally {
            setCreatingLesson(false);
        }
    };

    if (loading) return (
        <div className="bg-brand-bg min-h-screen flex items-center justify-center">
            <div className="animate-spin text-brand-primary"><Loader2 size={32} /></div>
        </div>
    );

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text flex flex-col">
            <NavBar />
            
            {/* Header */}
            <div className="bg-brand-surface border-b border-brand-border sticky top-16 z-30">
                <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/studio')} className="p-2 hover:bg-brand-elevated rounded-full transition-colors text-brand-muted">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold line-clamp-1">{course?.title || "Course Curriculum"}</h1>
                            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">Curriculum Editor</span>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/course/${courseId}`)} className="text-sm font-bold text-brand-text hover:text-brand-primary transition-colors">
                        Preview Course &rarr;
                    </button>
                </div>
            </div>

            <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 pb-32">
                
                {/* Modules List */}
                <div className="space-y-6">
                    {modules.sort((a, b) => a.order - b.order).map((module, index) => (
                        <div key={module._id} className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-sm transition-all">
                            {/* Module Header */}
                            <div 
                                onClick={() => toggleModule(module._id)}
                                className="p-5 flex items-center gap-4 cursor-pointer hover:bg-brand-elevated/50 transition-colors select-none"
                            >
                                <div className="text-brand-muted hover:text-brand-text cursor-grab">
                                    <GripVertical size={18} />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-xs font-bold text-brand-muted">
                                    {index + 1}
                                </div>
                                <h3 className="font-bold text-lg flex-1">{module.title}</h3>
                                
                                <button className="text-brand-muted hover:text-brand-primary px-3 py-1 text-sm font-bold transition-colors">
                                    Edit
                                </button>
                                <ChevronDown size={20} className={`text-brand-muted transition-transform duration-300 ${expandedModules[module._id] ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Module Content (Lessons) */}
                            {expandedModules[module._id] && (
                                <div className="border-t border-brand-border bg-brand-bg/30 p-2 space-y-1">
                                    {(!module.lessons || module.lessons.length === 0) ? (
                                        <div className="p-6 text-center text-brand-subtle text-sm">
                                            No lessons yet. Add a video or text lesson to get started.
                                        </div>
                                    ) : (
                                        module.lessons.sort((a, b) => a.order - b.order).map((lesson, lIdx) => (
                                            <div key={lesson._id} className="flex items-center gap-4 p-3 hover:bg-brand-elevated rounded-xl transition-colors group">
                                                <div className="text-brand-border group-hover:text-brand-muted cursor-grab ml-2">
                                                    <GripVertical size={14} />
                                                </div>
                                                <div className="text-brand-primary opacity-80">
                                                    {lesson.contentType === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />}
                                                </div>
                                                <span className="text-sm font-medium flex-1">
                                                    {index + 1}.{lIdx + 1} {lesson.title}
                                                </span>
                                                <span className="text-xs text-brand-muted font-mono bg-brand-surface px-2 py-1 rounded">
                                                    {lesson.duration || "5"} min
                                                </span>
                                            </div>
                                        ))
                                    )}

                                    {/* Add Lesson Form */}
                                    {lessonModuleId === module._id ? (
                                        <div className="m-2 p-5 bg-brand-surface border border-brand-primary/30 rounded-xl shadow-lg">
                                            <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-brand-primary">
                                                <Video size={16} /> New Lesson
                                            </h4>
                                            <form onSubmit={handleCreateLesson} className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="Lesson Title"
                                                    value={newLesson.title}
                                                    onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary"
                                                    required
                                                />
                                                <textarea
                                                    placeholder="Short description..."
                                                    value={newLesson.description}
                                                    onChange={e => setNewLesson({...newLesson, description: e.target.value})}
                                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary resize-none h-20"
                                                />
                                                
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
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
                                                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-brand-border hover:border-brand-primary text-brand-muted hover:text-brand-text py-3 rounded-lg transition-colors text-sm"
                                                        >
                                                            <Video size={16} />
                                                            {lessonFile ? lessonFile.name : "Select Video File (.mp4)"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-2">
                                                    <button type="button" onClick={() => setLessonModuleId(null)} className="px-4 py-2 text-sm font-bold text-brand-muted hover:text-brand-text">Cancel</button>
                                                    <button 
                                                        type="submit" 
                                                        disabled={creatingLesson}
                                                        className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                                    >
                                                        {creatingLesson ? <Loader2 size={16} className="animate-spin" /> : "Upload & Save"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setLessonModuleId(module._id); }}
                                            className="w-[calc(100%-16px)] mx-auto mt-2 mb-2 py-2 flex items-center justify-center gap-2 text-sm font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 rounded-xl transition-colors border border-brand-primary/10"
                                        >
                                            <Plus size={16} /> Add Lesson
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Module Button */}
                <div className="mt-6">
                    {showModuleInput ? (
                        <div className="bg-brand-surface border border-brand-primary/30 p-6 rounded-2xl shadow-lg">
                            <h4 className="font-bold mb-4">Create New Module</h4>
                            <div className="flex gap-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Advanced State Management"
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                                    onKeyDown={e => e.key === 'Enter' && handleCreateModule()}
                                />
                                <button 
                                    onClick={handleCreateModule}
                                    disabled={creatingModule}
                                    className="bg-brand-text text-brand-bg px-6 rounded-xl font-bold hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {creatingModule ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                                </button>
                                <button onClick={() => setShowModuleInput(false)} className="px-4 text-brand-muted hover:text-brand-text font-bold">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowModuleInput(true)}
                            className="w-full py-6 border-2 border-dashed border-brand-border hover:border-brand-primary text-brand-muted hover:text-brand-primary rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Add New Module
                        </button>
                    )}
                </div>

            </main>
        </div>
    );
}

export default CourseEditor;
