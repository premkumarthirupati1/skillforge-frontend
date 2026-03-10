import Dashboard from "./dashboard";
import InstructorDashBoard from "./InstructorDashBoard";
import NavBar from "../components/NavBar";
function UnifiedDashBoard() {
    const role = localStorage.getItem("role");
    if (!role) {
        return (
            <div className="min-h-screen bg-slate-50">
                <NavBar />
                <div className="p-10 text-center animate-pulse text-slate-400">
                    Verifying user role...
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-50">
            <main>
                {role === "instructor" ? (
                    <InstructorDashBoard />
                ) : (
                    <Dashboard />
                )}
            </main>
        </div>
    );
}
export default UnifiedDashBoard;