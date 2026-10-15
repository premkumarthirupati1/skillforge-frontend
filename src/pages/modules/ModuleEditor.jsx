import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ChevronLeft, Save, Loader2, Layers } from "lucide-react";
import api from "../../api";
import NavBar from "../../components/NavBar";

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
                    title: moduleData.title || "",
                    order: moduleData.order || 1,
                });
            } catch (err) {
                toast.error("Error loading module details");
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
                title: formData.title.trim(),
                order: Number(formData.order) || 1
            });
            toast.success("Module updated successfully");
            navigate(-1);
        } catch (err) {
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-10 h-10 rounded-full border-3 border-brand-border border-t-brand-primary animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest text-brand-muted">
                        Fetching module data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text transition-colors duration-300 flex flex-col selection:bg-brand-primary/30">
            <NavBar />
            
            <div className="max-w-xl mx-auto w-full py-12 px-6 flex-1 flex flex-col justify-center">
                <div className="bg-brand-surface p-8 rounded-3xl shadow-xl border border-brand-border space-y-6">
                    <header className="space-y-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors cursor-pointer mb-2"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight flex items-center gap-2">
                            <Layers size={22} className="text-brand-primary" /> Edit Module
                        </h2>
                        <p className="text-brand-subtle text-xs">
                            Adjust the title or sequence order for this curriculum section.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Module Title *
                            </label>
                            <input
                                name="title"
                                placeholder="e.g., Introduction to Neural Networks"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-brand-muted"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                                Sequence Order
                            </label>
                            <input
                                name="order"
                                type="number"
                                min="1"
                                placeholder="1"
                                value={formData.order}
                                onChange={handleChange}
                                className="w-full bg-brand-elevated border border-brand-border text-brand-text text-sm rounded-xl p-3.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-brand-border/60">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-brand-muted hover:text-brand-text bg-brand-elevated hover:bg-brand-elevated/80 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-brand-primary hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
