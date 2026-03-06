import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NavBar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };
    const toggleDark = () => {
        const html = document.documentElement;
        html.classList.toggle("dark");

    };
    return (
        <div className="sticky top-0 bg-white  dark:bg-gray-900 dark:text-white shadow-md px-6 py-4 flex justify-between items-center z-50">
            <h1
                className="text-xl font-bold cursor-pointer"
                onClick={() => navigate("/dashboard")}
            >
                SkillForge
            </h1>
            {token && <div className="flex items-center gap-6">
                <button
                    className="text-gray-700 hover:text-black"
                    onClick={() => navigate("/dashboard")}
                >
                    DashBoard
                </button>
                <button
                    onClick={toggleDark}
                    className="text-gray-700 hover:text-black"
                >
                    {document.documentElement.classList.contains("dark") ? "☀️" : "🌙"}
                </button>
                <div className="relative">
                    <div
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                    >
                        👤
                    </div>
                    {
                        menuOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                >
                                    Dashboard
                                </button>

                                <button
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                >
                                    Profile
                                </button>
                                {role === "instructor" && <button
                                    onClick={() => navigate("/instructor")}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100">
                                    Instructor
                                </button>}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                                >
                                    Logout
                                </button>

                            </div>
                        )
                    }
                </div>

            </div>}
        </div>
    );
}
export default NavBar;