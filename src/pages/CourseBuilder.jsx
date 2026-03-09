import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast";

function CourseBuilder() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ title: "", order: "" });

    const fetchModules = useCallback(async () => {
        try {
            const res = await api.get(`/modules/${courseId}/get-modules`);
            // Sort modules by 'order' before setting state
            const sortedModules = res.data.sort((a, b) => a.order - b.order);
            setModules(sortedModules);
        } catch (err) {
            toast.error("Failed to load modules");
            console.error(err);
        }
    }, [courseId]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateModule = async () => {
        if (!form.title.trim()) return toast.error("Title is required");

        setIsSubmitting(true);
        try {
            await api.post(`/modules/${courseId}/create`, {
                title: form.title,
                order: Number(form.order) || modules.length + 1,
            });

            toast.success("Module added");
            setForm({ title: "", order: "" });
            setShowInput(false);
            fetchModules();
        } catch (err) {
            toast.error("Error creating module");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <NavBar />
            <div className="max-w-4xl mx-auto py-12 px-6">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Course Builder</h1>
                        <p className="text-slate-500">Structure your course modules and lessons.</p>
                    </div>
                    <button
                        onClick={() => navigate('/instructor')}
                        className="text-sm font-semibold text-slate-600 hover:text-indigo-600"
                    >
                        &larr; Back to Dashboard
                    </button>
                </header>

                <div className="space-y-4">
                    {modules.length > 0 ? (
                        modules.map((module) => (
                            <div key={module._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 text-slate-500 h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm">
                                        {module.order}
                                    </div>
                                    <p className="font-bold text-slate-800 text-lg">{module.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/module/${module._id}/edit`)}
                                        className="bg-slate-50 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`/lesson-builder/${module._id}`)}
                                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all"
                                    >
                                        Build Lessons
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400">No modules created yet. Add your first module below.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    {!showInput ? (
                        <button
                            onClick={() => setShowInput(true)}
                            className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all"
                        >
                            + Add New Module
                        </button>
                    ) : (
                        <div className="bg-white border border-indigo-100 p-8 rounded-3xl shadow-xl shadow-indigo-50 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Title</label>
                                    <input
                                        name="title"
                                        placeholder="e.g., Introduction to Neural Networks"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Order</label>
                                    <input
                                        name="order"
                                        type="number"
                                        placeholder="Auto"
                                        value={form.order}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowInput(false)}
                                    className="px-6 py-2 text-slate-500 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateModule}
                                    disabled={isSubmitting}
                                    className="bg-black text-white px-8 py-2 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all"
                                >
                                    {isSubmitting ? "Saving..." : "Create Module"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseBuilder;