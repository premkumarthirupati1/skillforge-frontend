import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
function ModuleEditor() {
    const moduleId = useParams().moduleId;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        order: "",
    });
    useEffect(() => {
        fetchModule();
    }, [])
    const fetchModule = async () => {
        const res = await api.get(`/modules/${moduleId}/`);
        console.log(res);
        const course = res.data;
        setFormData({
            title: course.title,
            order: course.order,
        });
    };
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.patch(`/modules/${moduleId}/update-module`, {
            ...formData
        });
        navigate("/instructor");
    };
    return (
        <div className="bg-gray-100 min-h-screen">

            <NavBar />

            <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">

                <h2 className="text-2xl font-bold mb-6">
                    Edit Module
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="border p-3 w-full rounded"
                    />

                    <input
                        type="number"
                        value={formData.order}
                        onChange={handleChange}
                        className="border p-3 w-full rounded" />
                    <button
                        className="bg-black text-white px-5 py-2 rounded"
                    >
                        Save Changes
                    </button>

                </form>

            </div>

        </div>
    );
}
export default ModuleEditor;