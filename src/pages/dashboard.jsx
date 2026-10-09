import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    BookOpen, 
    Grid, 
    Trophy, 
    User, 
    HelpCircle, 
    LogOut, 
    Bell,
    Play,
    ChevronRight,
    Monitor,
    Code,
    Megaphone,
    BarChart2,
    Hammer,
    Sun,
    Moon
} from "lucide-react";
import { getImageUrl } from "../utils/imageHelper";
import NavBar from "../components/NavBar";

function Dashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile
                const userRes = await api.get('/user/profile');
                setUser(Array.isArray(userRes.data) ? userRes.data[0] : userRes.data);

                // Fetch Enrollments
                const enrollmentsRes = await api.get('/enrollment');
                
                // Fetch Course Details for each enrollment
                const courseDetailsPromises = enrollmentsRes.data.map(async (enrollment) => {
                    try {
                        const courseRes = await api.get(`/course/${enrollment.courseId}`);
                        return {
                            ...courseRes.data,
                            progress: enrollment.progress || 0
                        };
                    } catch (e) {
                        return null; // Ignore deleted/missing courses
                    }
                });

                const coursesData = await Promise.all(courseDetailsPromises);
                setCourses(coursesData.filter(c => c !== null));

            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Mock Icons for the Course Cards (to match the image)
    const mockIcons = [
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center"><Monitor size={20} /></div>,
        <div className="w-10 h-10 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center"><Code size={20} /></div>,
        <div className="w-10 h-10 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center"><Megaphone size={20} /></div>,
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center"><BarChart2 size={20} /></div>
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-brand-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans flex flex-col">
            <NavBar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto p-10 pb-20">
                {/* Header Welcome */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Welcome Back, {user?.name?.split(' ')[0] || 'Developer'}!
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Continue your learning journey.</p>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    
                    {/* Welcome Banner */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-brand-primary to-[#8A2BE2] rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-brand-primary/20 border border-white/10">
                        <div className="relative z-10 w-2/3">
                            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
                                Recommended
                            </span>
                            <h3 className="text-2xl font-bold text-white mt-4 mb-2 leading-snug">
                                Build a Modern Web App with React & Node
                            </h3>
                            <p className="text-brand-primary-light text-sm mb-6 leading-relaxed">
                                Join 10,000+ students learning how to build scalable full-stack applications.
                            </p>
                            <button 
                                onClick={() => navigate('/course-showcase')}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
                            >
                                View All Courses
                            </button>
                        </div>
                        
                        {/* Decorative background elements */}
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                        <div className="absolute top-0 right-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
                        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-40 h-40 border-[16px] border-white/5 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)]"></div>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold">Overall Progress</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Across all courses</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                <Trophy className="text-brand-primary" size={24} />
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-4xl font-black text-brand-primary tracking-tighter">68%</span>
                                <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-1">
                                    +12% <ChevronRight size={14} className="-rotate-90" />
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-brand-primary w-[68%] h-full rounded-full relative">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* My Courses Grid */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Active Courses</h3>
                        <button onClick={() => navigate('/course-showcase')} className="text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                            See All
                        </button>
                    </div>
                    
                    {courses.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-lg">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center mb-4 text-slate-500 dark:text-slate-400">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No active courses</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                                You haven't enrolled in any courses yet. Browse the catalog to start learning.
                            </p>
                            <button 
                                onClick={() => navigate('/course-showcase')}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_4px_15px_rgba(99,102,241,0.3)]"
                            >
                                Browse Catalog
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.slice(0, 4).map((course, index) => (
                                <div 
                                    key={course._id} 
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        {mockIcons[index % mockIcons.length]}
                                        <button className="text-slate-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    
                                    <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                                        {course.title}
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-6">
                                        {course.author}
                                    </p>
                                    
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mb-3 overflow-hidden">
                                        <div 
                                            className="bg-brand-primary h-full rounded-full relative" 
                                            style={{ width: `${course.progress}%` }}
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <span className="text-slate-900 dark:text-white">{course.progress}%</span>
                                        <span>{course.progress === 100 ? "Completed" : "In Progress"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* Learning Activity Chart */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg flex flex-col min-h-[320px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold">Learning Activity</h3>
                            <button className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Progress <ChevronRight size={14} className="rotate-90" />
                            </button>
                        </div>
                        
                        <div className="flex-1 flex gap-4">
                            <div className="flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 font-medium py-2">
                                <span>80</span>
                                <span>60</span>
                                <span>40</span>
                                <span>20</span>
                                <span>0</span>
                            </div>
                            
                            <div className="flex-1 border-b border-gray-800 flex justify-between items-end pb-0 relative">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-full border-b border-gray-800/50 h-0"></div>
                                    ))}
                                </div>
                                
                                {[
                                    { day: 'Mon', h: '45%' },
                                    { day: 'Tue', h: '60%' },
                                    { day: 'Wed', h: '70%' },
                                    { day: 'Thu', h: '35%' },
                                    { day: 'Fri', h: '50%' },
                                    { day: 'Sat', h: '85%' },
                                    { day: 'Sun', h: '25%' },
                                ].map((data, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-3 relative z-10 w-full">
                                        <div 
                                            className="w-10 bg-brand-primary rounded-t-sm hover:brightness-125 transition-all cursor-pointer relative group/bar"
                                            style={{ height: data.h }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                                                {data.h}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{data.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recently Viewed Lessons */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg flex flex-col min-h-[320px]">
                        <h3 className="text-lg font-bold mb-6">Recently Viewed Courses</h3>
                        
                        {courses.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                No recent activity.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courses.slice(0, 3).map((course, idx) => (
                                    <div key={course._id} onClick={() => navigate(`/course/${course._id}`)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                            <Play size={20} className="ml-1" fill="currentColor" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-1">{course.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Progress: {course.progress}%</p>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Dashboard;
