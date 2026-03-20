import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";

function CourseDetails() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const navigate = useNavigate();

    const fetchCourse = async () => {
        try {
            const result = await api.get(`/course/${courseId}/full`);
            setCourse(result.data.course);
            setModules(result.data.modules);
            setIsEnrolled(result.data.isEnrolled);
        } catch (err) {
            console.log(err);
        }
    };

    const handleComplete = async (e, moduleId) => {
        e.stopPropagation();
        try {
            await api.patch(`/module/${moduleId}/complete`)
        }
        catch (err) {
            console.log(err);
        }
    }

    const enrollCourse = async () => {
        try {
            await api.post(`/enrollments/${courseId}/enroll`);
            setIsEnrolled(true);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    if (!course) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <NavBar />

            {/* DARK HEADER SECTION */}
            <div className="bg-slate-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-3 gap-12 items-center">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-600 text-[10px] font-bold uppercase px-2 py-1 rounded">
                                {course.difficulty}
                            </span>
                            <span className="text-slate-400 text-sm">{modules.length} Modules</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                            {course.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 -mt-8 grid lg:grid-cols-3 gap-8">

                {/* LEFT: CURRICULUM */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Course Curriculum</h2>
                            <span className="text-sm text-slate-500">{isEnrolled ? 'Unlocked' : 'Locked'}</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {modules.map((module, index) => {
                                const isModuleDone = module.lessons && module.lessons.length > 0
                                    ? module.lessons.every(lesson => lesson.completed)
                                    : false;
                                return (
                                    <div
                                        key={module._id}
                                        onClick={() => isEnrolled && navigate(`/module/${module._id}`)}
                                        className={`group p-5 flex items-center gap-4 transition-colors ${isEnrolled ? "cursor-pointer hover:bg-slate-50" : "bg-slate-50/50"
                                            }`}
                                    >
                                        {/* DYNAMIC ICON: Number or Checkmark */}
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all 
                    ${isModuleDone
                                                    ? "bg-green-100 border-green-200 text-green-600 shadow-sm"
                                                    : isEnrolled
                                                        ? "bg-blue-50 border-blue-200 text-blue-600"
                                                        : "bg-slate-100 border-slate-200 text-slate-400"
                                                }`}
                                        >
                                            {isModuleDone ? (
                                                <svg className="w-5 h-5 animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className={`font-semibold transition-all ${isEnrolled ? "text-slate-800" : "text-slate-400"
                                                } ${isModuleDone ? "text-slate-500 line-through" : ""}`}>
                                                {module.title}
                                            </h3>
                                            {!isEnrolled && (
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Locked</span>
                                            )}
                                        </div>

                                        {/* Status Indicator */}
                                        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                            {isEnrolled ? (
                                                isModuleDone ? (
                                                    <span className="text-xs font-bold text-green-500 uppercase">Completed</span>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    </svg>
                                                )
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT: STICKY ENROLL CARD */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <div className="text-center mb-6">
                            <div className="text-4xl font-black text-slate-900">${course.price}</div>
                        </div>

                        {!isEnrolled ? (
                            <button
                                onClick={enrollCourse}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 mb-4"
                            >
                                Enroll Now
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/module/${modules[0]?._id}`)}
                                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all mb-4"
                            >
                                Continue Learning
                            </button>
                        )}

                        <div className="space-y-4 text-sm text-slate-600">
                            <div className="flex items-center gap-3">
                                <span>✅ Lifetime Access</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>📜 Certificate of Completion</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CourseDetails;