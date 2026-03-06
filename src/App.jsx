import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseView from "./pages/courseView";
import InstructorDashBoard from "./pages/InstructorDashBoard";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import CourseBuilder from "./pages/CourseBuilder";
import LessonBuilder from "./pages/LessonBuilder";
import ModuleEditor from "./pages/ModuleEditor";
import EditLesson from "./pages/EditLesson";
import HomePage from "./pages/Homepage";
import Signup from "./pages/Singup";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
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
        <Route path="/course-builder/:courseId" element={
          <ProtectedRoute>
            <CourseBuilder />
          </ProtectedRoute>
        } />
        <Route path="/module/:moduleId/edit" element={
          <ProtectedRoute>
            <ModuleEditor />
          </ProtectedRoute>
        } />
        <Route path="/lesson-builder/:moduleId" element={
          <ProtectedRoute>
            <LessonBuilder />
          </ProtectedRoute>
        } />
        <Route path="/edit-lesson/:lessonId" element={
          <ProtectedRoute>
            <EditLesson />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;