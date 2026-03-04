import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
function EditCourse() {
    const courseId = useParams().courseId;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        tags: ""
    });
    useEffect(() => {
        fetchCourse();
    }, [])
    const fetchCourse = async () => {
        const res = await api.get(`/course/${courseId}/full`);
        const course = res.data.course;
        setFormData({
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            tags: course.tags.join(",")
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
        const tagsArray = formData.tags.split(",").map(t => t.trim());
        await api.patch(`/course/${courseId}/update-course`, {
            ...formData,
            tags: tagsArray
        });
        navigate("/instructor");
    };
    return (
        <div className="bg-gray-100 min-h-screen">

            <NavBar />

            <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">

                <h2 className="text-2xl font-bold mb-6">
                    Edit Course
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="border p-3 w-full rounded"
                    />

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="border p-3 w-full rounded"
                    />

                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="border p-3 w-full rounded"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="border p-3 w-full rounded"
                    />

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
export default EditCourse;