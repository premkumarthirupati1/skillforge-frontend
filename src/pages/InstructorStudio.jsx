import { useEffect, useState } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Plus, MoreVertical, Edit2, Trash2, Globe, Lock, PlayCircle, Clock, Users } from "lucide-react";

function InstructorStudio() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionMenu, setActionMenu] = useState(null);

    const fetchCourses = async () => {
        try {
            const result = await api.get('/course/instructor');
            setCourses(Array.isArray(result.data) ? result.data : (result.data?.courses || []));
        } catch (err) {
            toast.error("Error loading courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure? This will permanently delete the course and all its content.")) return;
        try {
            await api.delete(`/course/${courseId}/delete`);
            setCourses(prev => prev.filter(c => c._id !== courseId));
            toast.success("Course deleted successfully");
        } catch (err) {
            toast.error("Failed to delete course");
        }
    };

    const handlePublishToggle = async (courseId) => {
        try {
            const res = await api.patch(`/course/${courseId}/publish`);
            setCourses(prev =>
                prev.map(course =>
                    course._id === courseId ? { ...course, isPublished: res.data.isPublished } : course
                )
            );
            toast.success(res.data.isPublished ? "Course Published" : "Course Moved to Draft");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col">
            <NavBar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Creator Studio</h1>
                        <p className="text-brand-subtle">Manage your premium content and monitor student engagement.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search courses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-brand-surface border border-brand-border text-brand-text text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all placeholder-brand-muted"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/create-course')}
                            className="bg-brand-text hover:bg-white text-brand-bg font-bold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shrink-0 shadow-lg"
                        >
                            <Plus size={18} />
                            New Course
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-brand-muted font-mono text-sm uppercase tracking-widest">Loading Studio...</p>
                        </div>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-brand-surface border border-dashed border-brand-border rounded-3xl">
                        <div className="w-16 h-16 bg-brand-elevated rounded-full flex items-center justify-center mb-4 text-brand-muted">
                            <PlayCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
                        <p className="text-brand-subtle mb-6 max-w-md">You haven't created any courses yet. Start building your curriculum to share your knowledge with the world.</p>
                        <button onClick={() => navigate('/create-course')} className="text-brand-primary font-bold hover:underline">Create your first course &rarr;</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course._id} className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-primary/40 transition-colors group relative flex flex-col">
                                
                                {/* Status Badge */}
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-lg ${course.isPublished ? 'bg-green-500/90 text-white' : 'bg-brand-elevated/90 text-brand-muted border border-brand-border'}`}>
                                        {course.isPublished ? <Globe size={10} /> : <Lock size={10} />}
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {/* Thumbnail */}
                                <div className="aspect-video bg-brand-elevated relative overflow-hidden cursor-pointer" onClick={() => navigate(`/studio/course/${course._id}`)}>
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail.startsWith('http') ? course.thumbnail : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-brand-muted">
                                            <PlayCircle size={48} opacity={0.2} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-80" />
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors cursor-pointer" onClick={() => navigate(`/studio/course/${course._id}`)}>
                                        {course.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-4 mt-auto pt-4 text-xs font-medium text-brand-muted border-t border-brand-border/50">
                                        <span className="flex items-center gap-1.5">
                                            <Users size={14} />
                                            {course.studentsEnrolled?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {new Date(course.publishedAt || course.createdAt).toLocaleDateString()}
                                        </span>
                                        
                                        <div className="ml-auto relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActionMenu(actionMenu === course._id ? null : course._id);
                                                }}
                                                className="p-1.5 hover:bg-brand-elevated rounded-md transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {actionMenu === course._id && (
                                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-brand-elevated border border-brand-border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={() => navigate(`/studio/course/${course._id}`)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface flex items-center gap-2">
                                                        <Edit2 size={14} /> Edit Curriculum
                                                    </button>
                                                    <button onClick={() => navigate(`/course/${course._id}/edit`)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface flex items-center gap-2">
                                                        <Globe size={14} /> Course Settings
                                                    </button>
                                                    <div className="h-px bg-brand-border my-1" />
                                                    <button onClick={() => { handlePublishToggle(course._id); setActionMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface flex items-center gap-2">
                                                        {course.isPublished ? <Lock size={14} /> : <Globe size={14} />} 
                                                        {course.isPublished ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                    <button onClick={() => { handleDelete(course._id); setActionMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default InstructorStudio;
