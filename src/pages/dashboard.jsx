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
    Hammer
} from "lucide-react";
import { getImageUrl } from "../utils/imageHelper";

function Dashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load theme as strictly dark for this specific dashboard view to match the image perfectly
        document.documentElement.classList.add("dark");

        const fetchData = async () => {
            try {
                // Fetch User Profile
                const userRes = await api.get('/user/profile');
                setUser(Array.isArray(userRes.data) ? userRes.data[0] : userRes.data);

                // Fetch Enrollments
                const res = await api.post("/enrollments/get-courses");
                const rawEnrollments = Array.isArray(res.data) ? res.data : [];
                const validEnrollments = rawEnrollments.filter(e => e && e.courseId);
                
                // Map API data into the UI format required by the mockup
                setCourses(validEnrollments.map(e => ({
                    _id: e.courseId._id,
                    title: e.courseId.title,
                    author: "By SkillForge", // Fallback if instructor name isn't populated
                    progress: e.progress || 0,
                    thumbnail: e.courseId.thumbnail,
                    modulesLeft: Math.max(0, 20 - Math.floor((e.progress || 0) / 5)) // Mock "modules left" based on progress
                })));

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) { }
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        navigate('/');
    };

    // Sidebar Navigation Items
    const navItems = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, active: true, path: "/dashboard" },
        { name: "My Courses", icon: <BookOpen size={20} />, active: false, path: "/dashboard" },
        { name: "Catalog", icon: <Grid size={20} />, active: false, path: "/course-showcase" },
        { name: "Achievements", icon: <Trophy size={20} />, active: false, path: "/dashboard" },
        { name: "Profile", icon: <User size={20} />, active: false, path: "/dashboard" },
    ];

    // Mock Icons for the Course Cards (to match the image)
    const mockIcons = [
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center"><Monitor size={20} /></div>,
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center"><Code size={20} /></div>,
        <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center"><Megaphone size={20} /></div>,
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center"><BarChart2 size={20} /></div>
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#131419] flex items-center justify-center text-brand-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0E0F14] text-white font-sans overflow-hidden">
            
            {/* ========================================== */}
            {/* SIDEBAR                                    */}
            {/* ========================================== */}
            <aside className="w-[280px] bg-[#1C1D24] flex flex-col h-full border-r border-white/5 relative z-20">
                
                {/* Logo */}
                <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <div className="absolute inset-0 bg-brand-primary blur-md opacity-50 rounded-full"></div>
                        <Hammer className="text-white relative z-10" size={24} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full blur-[2px] -mt-1 -mr-1 mix-blend-screen"></div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SkillForge</h1>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {navItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${
                                item.active 
                                ? "bg-[#28255A] text-brand-primary shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-brand-primary/20" 
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <span className={item.active ? "text-brand-primary" : "text-gray-400"}>
                                {item.icon}
                            </span>
                            {item.name}
                        </button>
                    ))}
                </nav>

                {/* Bottom Nav */}
                <div className="px-6 pb-8 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <User size={20} /> Profile
                    </button>
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <HelpCircle size={20} /> Help
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mt-4">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* ========================================== */}
            {/* MAIN CONTENT                               */}
            {/* ========================================== */}
            <main className="flex-1 bg-[#131419] h-full overflow-y-auto custom-scrollbar">
                <div className="max-w-[1200px] mx-auto p-10 pb-20">
                    
                    {/* Header */}
                    <header className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Welcome Back, {user?.name?.split(' ')[0] || 'Developer'}!
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-[#1C1D24] px-4 py-2 rounded-full border border-white/5">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id || 'alex'}`} 
                                    alt="Avatar" 
                                    className="w-8 h-8 rounded-full bg-[#2A2B35]"
                                />
                                <span className="text-sm font-medium text-gray-300">{user?.email || 'student@skillforge.com'}</span>
                            </div>
                            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                <Bell size={24} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#131419]"></span>
                            </button>
                        </div>
                    </header>

                    {/* Banner */}
                    <div className="bg-[#1C1D24] border border-white/5 rounded-2xl p-8 flex justify-between items-center mb-10 shadow-lg">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Continue Your Learning Journey!</h3>
                            <p className="text-gray-400">Continue your learning journey across enrolled Courses.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/course-showcase')}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
                        >
                            View All Courses
                        </button>
                    </div>

                    {/* My Courses */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">My Courses</h3>
                            <button onClick={() => navigate('/course-showcase')} className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm transition-colors">
                                View Catalog
                            </button>
                        </div>
                        
                        {courses.length === 0 ? (
                            <div className="bg-[#1C1D24] border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center">
                                <BookOpen size={40} className="text-gray-600 mb-4" />
                                <h4 className="text-lg font-bold text-gray-300">No Courses Yet</h4>
                                <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
                                <button 
                                    onClick={() => navigate('/course-showcase')}
                                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold transition-all"
                                >
                                    Explore Library
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {courses.map((course, idx) => (
                                    <div key={course._id} onClick={() => navigate(`/course/${course._id}`)} className="bg-[#1C1D24] border border-white/5 rounded-2xl p-6 hover:-translate-y-1 transition-transform cursor-pointer shadow-lg group">
                                        {mockIcons[idx % mockIcons.length]}
                                        
                                        <h4 className="font-bold text-lg mt-5 mb-1 line-clamp-2 group-hover:text-brand-primary transition-colors h-14">
                                            {course.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mb-6 font-medium tracking-wide uppercase">
                                            {course.author}
                                        </p>
                                        
                                        <div className="w-full bg-[#2A2B35] h-1.5 rounded-full mb-3 overflow-hidden">
                                            <div 
                                                className="bg-brand-primary h-full rounded-full relative" 
                                                style={{ width: `${course.progress}%` }}
                                            >
                                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                                            <span className="text-white">{course.progress}%</span>
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
                        <div className="lg:col-span-3 bg-[#1C1D24] border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col min-h-[320px]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-bold">Learning Activity</h3>
                                <button className="text-gray-400 text-sm flex items-center gap-2 hover:text-white transition-colors">
                                    Progress <ChevronRight size={14} className="rotate-90" />
                                </button>
                            </div>
                            
                            <div className="flex-1 flex gap-4">
                                <div className="flex flex-col justify-between text-xs text-gray-500 font-medium py-2">
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
                                            <span className="text-xs text-gray-500 font-medium">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recently Viewed Lessons */}
                        <div className="lg:col-span-2 bg-[#1C1D24] border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col min-h-[320px]">
                            <h3 className="text-lg font-bold mb-6">Recently Viewed Courses</h3>
                            
                            {courses.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 font-medium text-sm border border-dashed border-white/5 rounded-xl">
                                    No recent activity.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {courses.slice(0, 3).map((course, idx) => (
                                        <div key={course._id} onClick={() => navigate(`/course/${course._id}`)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                <Play size={20} className="ml-1" fill="currentColor" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">{course.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">Progress: {course.progress}%</p>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
            
            {/* Add custom scrollbar styling injected just for this view */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #131419; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2A2B35; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f4150; 
                }
            `}} />
        </div>
    );
}

export default Dashboard;
