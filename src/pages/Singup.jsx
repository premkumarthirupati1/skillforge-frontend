import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student"
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

            await api.post("/auth/signup", formData);

            navigate("/login");

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="bg-gray-100 min-h-screen">

            <NavBar />

            <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow">

                <h2 className="text-2xl font-bold text-center mb-6">
                    Create Your Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* NAME */}

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                        required
                    />

                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                        required
                    />

                    {/* PASSWORD */}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                        required
                    />

                    {/* ROLE */}

                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border p-3 rounded"
                    >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                    </select>

                    {/* BUTTON */}

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                    >
                        Sign Up
                    </button>

                </form>

                {/* LOGIN LINK */}

                <p className="text-center text-gray-600 mt-4">

                    Already have an account?

                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-600 cursor-pointer ml-1"
                    >
                        Login
                    </span>

                </p>

            </div>

        </div>

    );

}

export default Signup;