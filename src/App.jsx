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
import Signup from "./pages/Signup";
import CourseShowcase from "./pages/CourseShowcase";
import CourseDetails from "./pages/CourseDetails";
import Profile from "./pages/Profile";
import UnifiedDashBoard from "./pages/UnifiedDashboard";
import LessonsView from "./pages/LessonsView";
import LessonViewer from "./pages/LessonViewer";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import ComingSoon from "./pages/ComingSoon";
import InstructorStudio from "./pages/InstructorStudio";
import CourseEditor from "./pages/CourseEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Core catalog routes */}
        <Route path="/course-showcase" element={<CourseShowcase />} />
        <Route path="/courses" element={<CourseShowcase />} />
        
        {/* Nav Links mapping */}
        <Route path="/learn" element={<CourseShowcase />} />
        <Route path="/skills" element={<CourseShowcase />} />
        <Route path="/projects" element={<ComingSoon title="Project Forge" />} />
        <Route path="/challenges" element={<ComingSoon title="Coding Challenges" />} />
        <Route path="/community" element={<ComingSoon title="Community Hub" />} />

        <Route path="/course/:courseId" element={<CourseDetails />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UnifiedDashBoard />
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
        <Route path="/studio" element={
          <ProtectedRoute>
            <InstructorStudio />
          </ProtectedRoute>
        } />
        <Route path="/studio/course/:courseId" element={
          <ProtectedRoute>
            <CourseEditor />
          </ProtectedRoute>
        } />
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
        <Route path="/module/:moduleId" element={
          <ProtectedRoute>
            <LessonsView />
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
        <Route path="/lesson/:lessonId" element={
          <ProtectedRoute>
            <LessonViewer />
          </ProtectedRoute>
        } />
        <Route path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />
        <Route path="/auth/forgot-password/:token"
          element={<ResetPassword />}
        />
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;