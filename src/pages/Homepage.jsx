import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

function HomePage() {

    const navigate = useNavigate();
    return (
        <div className="bg-gray-100 min-h-screen">

            <NavBar />

            <div className="max-w-6xl mx-auto px-8 py-20">

                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* LEFT SIDE */}

                    <div>

                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Learn Skills That Shape Your Future
                        </h1>

                        <p className="text-gray-600 text-lg mb-8">
                            Build real-world skills with structured courses created by
                            experienced instructors.
                        </p>

                        <div className="flex gap-4">

                            <button
                                onClick={() => navigate("/signup")}
                                className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
                            >
                                Get Started
                            </button>

                            <button
                                onClick={() => navigate("/login")}
                                className="border border-black px-6 py-3 rounded"
                            >
                                Login
                            </button>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="bg-white rounded-lg shadow p-10 text-center">

                        <h2 className="text-2xl font-semibold mb-4">
                            Why Learn With Us?
                        </h2>

                        <ul className="text-gray-600 space-y-2">

                            <li>✔ Structured learning paths</li>
                            <li>✔ Video lessons</li>
                            <li>✔ Interactive quizzes</li>
                            <li>✔ Track your progress</li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default HomePage;