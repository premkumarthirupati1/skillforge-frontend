import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseView from "./pages/courseView";
import InstructorDashBoard from "./pages/InstructorDashBoard";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId/full" element={
          <ProtectedRoute>
            <CourseView />
          </ProtectedRoute>
        } />
        <Route path="/instructor" element={
          <ProtectedRoute>
            <InstructorDashBoard />
          </ProtectedRoute>
        }
        />
        <Route path="/create-course" element={
          <ProtectedRoute>
            <CreateCourse />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId/edit" element={
          <ProtectedRoute>
            <EditCourse />
          </ProtectedRoute>
        }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;