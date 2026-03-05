import { useEffect, useState } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { useNavigate, useParams } from "react-router-dom";

function CourseBuilder() {
    const navigate = useNavigate();
    const courseId = useParams().courseId;
    const [modules, setModules] = useState([]);
    const [showInput, setShowInput] = useState(false); ("");
    const [form, setForm] = useState({
        title: "",
        order: ""
    });
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    const fetchModules = async () => {
        try {
            const res = await api.get(`/modules/${courseId}/get-modules`);
            console.log(res.data);
            setModules(res.data);
        }
        catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchModules();
    }, [])
    const createModule = async () => {
        try {

            await api.post(`/modules/${courseId}/create`, {
                title: form.title,
                order: Number(form.order),
            });

            setForm({
                title: "",
                order: ""
            });

            fetchModules();

        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div className="bg-gray-100 min-h-screen">
            <NavBar />
            <div className="max-w-3xl mx-auto p-8">
                <h1 className="text-3xl font-bold m-6">
                    Course Builder
                </h1>
                <div className="space-y-3">
                    {modules && modules.map(module => (

                        <div
                            key={module._id}
                            className="bg-white p-5 rounded shadow flex justify-between items-center"
                        >

                            <div>
                                <p className="font-semibold">
                                    {module.order}. {module.title}
                                </p>
                            </div>

                            <div className="flex gap-3">

                                <button
                                    onClick={() => navigate(`/module/${module._id}/edit`)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Edit Module
                                </button>

                                <button
                                    onClick={() => navigate(`/lesson-builder/${module._id}`)}
                                    className="bg-purple-500 text-white px-3 py-1 rounded"
                                >
                                    Edit Lessons
                                </button>

                            </div>

                        </div>

                    ))}
                </div>
                <div className="mt-6">
                    {!showInput && (
                        <button onClick={() => setShowInput(true)}
                            className="text-blue-600 font-semibold"
                        >
                            + Add Module
                        </button>
                    )}
                    {showInput && (
                        <div className="bg-white p-6 rounded shadow mt-4 space-y-4">

                            {/* TITLE */}

                            <input
                                name="title"
                                placeholder="Module Title"
                                value={form.title}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded"
                            />

                            {/* ORDER */}

                            <input
                                name="order"
                                type="number"
                                placeholder="Module Order"
                                value={form.order}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded"
                            />

                            <button
                                onClick={createModule}
                                className="bg-black text-white px-4 py-2 rounded"
                            >
                                Save Module
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default CourseBuilder;