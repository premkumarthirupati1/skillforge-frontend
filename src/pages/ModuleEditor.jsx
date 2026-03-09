import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { toast } from "react-hot-toast"; // Recommended for user feedback

function ModuleEditor() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        order: "",
    });

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const res = await api.get(`/modules/${moduleId}/`);
                const moduleData = res.data;
                setFormData({
                    title: moduleData.title,
                    order: moduleData.order,
                });
            } catch (err) {
                toast.error("Error loading module details");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchModule();
    }, [moduleId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            return toast.error("Module title cannot be empty");
        }

        setIsSaving(true);
        try {
            await api.patch(`/modules/${moduleId}/update-module`, {
                title: formData.title,
                order: Number(formData.order)
            });
            toast.success("Module updated successfully");
            // Navigate back to the specific course builder instead of general dashboard
            navigate(-1);
        } catch (err) {
            toast.error("Failed to save changes");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavBar />
            <div className="flex-1 flex items-center justify-center text-slate-400">
                Fetching module data...
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <NavBar />
            <div className="max-w-xl mx-auto py-16 px-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <header className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900">Edit Module</h2>
                        <p className="text-slate-500 mt-2">Adjust the sequence or title of this module.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                Module Title
                            </label>
                            <input
                                name="title"
                                placeholder="e.g., Introduction to Neural Networks"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                Sequence Order
                            </label>
                            <input
                                name="order"
                                type="number"
                                placeholder="1"
                                value={formData.order}
                                onChange={handleChange}
                                className="w-full border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${isSaving ? "bg-slate-300" : "bg-black hover:bg-slate-800"
                                    }`}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ModuleEditor;