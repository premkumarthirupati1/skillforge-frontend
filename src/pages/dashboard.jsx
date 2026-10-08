import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { getImageUrl } from "../utils/imageHelper";
import { PlayCircle, ArrowRight, Award, LayoutDashboard, Compass } from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unownedCourses, setUnownedCourses] = useState([]);
    const SERVER_URL = "http://localhost:3000";

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.post("/enrollments/get-courses");
                const rawEnrollments = Array.isArray(res.data) ? res.data : [];
                const validEnrollments = rawEnrollments.filter(e => e && e.courseId);
                setCourses(validEnrollments);

                const allRes = await api.get("/course/public");
                const allCourses = Array.isArray(allRes.data) ? allRes.data : [];

                const enrolledIds = validEnrollments.map(e => {
                    const id = e.courseId?._id || e.courseId;
                    return id ? id.toString() : "";
                }).filter(Boolean);

                const filtered = allCourses.filter(c =>
                    c && c._id && !enrolledIds.includes(c._id.toString())
                );

                setUnownedCourses(filtered.slice(0, 3));
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-subtle">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium tracking-widest uppercase">Syncing Workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-page">
            <NavBar />

            <div className="max-w-7xl mx-auto px-6 py-12 relative">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />

                <header className="mb-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border shadow-sm mb-4">
                        <LayoutDashboard size={14} className="text-brand-primary" />
                        <span className="text-xs font-semibold tracking-wide text-brand-muted uppercase">
                            Student Workspace
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-brand-text tracking-tight text-glow">
                        Welcome back.
                    </h1>
                    <p className="text-brand-muted mt-3 text-lg max-w-2xl">
                        Pick up right where you left off. Review your active streams and continue building your expertise.
                    </p>
                </header>

                <div className="flex items-center justify-between mb-8 border-b border-brand-border pb-4 relative z-10">
                    <h2 className="text-lg font-bold text-brand-text tracking-tight flex items-center gap-2">
                        Active Enrollments
                        <span className="bg-brand-elevated border border-brand-border text-brand-subtle px-2 py-0.5 rounded text-[10px] font-black">
                            {courses.length}
                        </span>
                    </h2>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border relative z-10">
                        <div className="w-16 h-16 bg-brand-elevated border border-brand-border rounded-2xl mx-auto flex items-center justify-center mb-4 text-brand-subtle">
                            <Compass size={32} />
                        </div>
                        <p className="text-brand-muted mb-6 font-medium">Your workspace is currently empty.</p>
                        <button
                            onClick={() => navigate('/course-showcase')}
                            className="bg-brand-text text-brand-bg hover:bg-brand-text/90 px-6 py-2.5 rounded-lg transition-all font-bold text-sm inline-flex items-center gap-2"
                        >
                            Explore Courses <ArrowRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {courses.map((enrollment) => {
                            const course = enrollment.courseId || {};
                            return (
                                <div
                                    key={enrollment._id}
                                    onClick={() => {
                                        if (enrollment.lastAccessedLesson) {
                                            navigate(`/lesson/${enrollment.lastAccessedLesson}?courseId=${course._id}`);
                                        } else {
                                            navigate(`/course/${course._id}`);
                                        }
                                    }}
                                    className="group bg-brand-surface border border-brand-border rounded-xl cursor-pointer hover:border-brand-primary/50 transition-all duration-card hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] overflow-hidden flex flex-col"
                                >
                                    <div className="h-40 w-full overflow-hidden bg-brand-elevated relative">
                                        {course.thumbnail ? (
                                            <img
                                                src={getImageUrl(course.thumbnail)}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-card group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-brand-subtle text-xs font-bold uppercase tracking-widest bg-grid-pattern">
                                                SkillForge
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text bg-brand-bg/80 backdrop-blur border border-brand-border px-2 py-0.5 rounded">
                                                {enrollment.progress === 100 ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-brand-text mb-4 leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                                            {course.title || "Untitled Course"}
                                        </h3>

                                        <div className="mt-auto">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">Progress</span>
                                                <span className="text-xs font-bold text-brand-text">{enrollment.progress || 0}%</span>
                                            </div>

                                            <div className="w-full bg-brand-elevated rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-brand-primary h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${enrollment.progress || 0}%` }}
                                                />
                                            </div>

                                            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                                {enrollment.progress === 100 ? (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            navigate(`/certificate/${course._id}`); 
                                                        }} 
                                                        className="flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 w-full"
                                                    >
                                                        <Award size={14} /> View Certificate
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-brand-primary">
                                                        <PlayCircle size={14} />
                                                        Resume Course
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {unownedCourses.length > 0 && (
                    <section className="mt-20 pt-12 border-t border-brand-border relative z-10">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-text tracking-tight">
                                    Expand Your Expertise
                                </h2>
                                <p className="text-brand-subtle mt-1 text-sm">Recommended paths for your next challenge.</p>
                            </div>
                            <button
                                onClick={() => navigate("/course-showcase")}
                                className="text-brand-primary font-medium hover:text-brand-primary/80 flex items-center gap-1.5 text-sm transition-colors"
                            >
                                View Library <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {unownedCourses.map(course => (
                                <div
                                    key={course._id}
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="group cursor-pointer bg-brand-surface rounded-xl p-4 border border-brand-border hover:border-brand-primary/40 transition-all flex gap-4 items-center"
                                >
                                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-brand-elevated">
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            alt={course.title}
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-2 text-sm">
                                            {course.title}
                                        </h4>
                                        <span className="text-[10px] uppercase font-bold text-brand-subtle mt-1.5 block tracking-wider">
                                            {course.difficulty}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
