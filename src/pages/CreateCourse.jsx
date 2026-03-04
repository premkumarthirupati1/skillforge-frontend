import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../api";
function CreateCourse() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        tags: ""
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tagsArray = formData.tags.split(",").map(tag => tag.trim());
            const res = await api.post("/course/create-course", {
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                tags: tagsArray
            });
            navigate(`/course-builder/${res.data.course._id}`);
        }
        catch (err) {
            console.log(err);
        }
    };
    return (
        <div className="bg-gray-100 min-h-screen">
            <NavBar />
            <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
                <h2 className="text-2xl font-bold mb-6">
                    Create new Course
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text"
                        name="title"
                        placeholder="Course Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Course Description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    />
                    <select name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="w-full border p-3 rounded">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <input type="text"
                        name="tags"
                        placeholder="Tags (comma seperated)"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full border p-3 rounded" />

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                    >
                        Create Course
                    </button>
                </form>
            </div>
        </div>
    );
}
export default CreateCourse;