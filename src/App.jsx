import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Course Discovery & Details
import CourseShowcase from "./pages/courses/CourseShowcase";
import CourseDetails from "./pages/courses/CourseDetails";
import CourseView from "./pages/courses/CourseView";

// Module & Curriculum Management (Studio)
import ModuleEditor from "./pages/modules/ModuleEditor";
import CourseEditor from "./pages/modules/CourseEditor";
import CreateCourse from "./pages/modules/CreateCourse";
import EditCourse from "./pages/modules/EditCourse";
import LessonBuilder from "./pages/modules/LessonBuilder";
import EditLesson from "./pages/modules/EditLesson";
import InstructorStudio from "./pages/modules/InstructorStudio";

// Student Learning & Player
import LessonViewer from "./pages/learning/LessonViewer";
import LessonsView from "./pages/learning/LessonsView";
import CertificateViewer from "./pages/learning/CertificateViewer";

// Workspace & Dashboard
import Dashboard from "./pages/dashboard/Dashboard";
import UnifiedDashBoard from "./pages/dashboard/UnifiedDashboard";
import Profile from "./pages/dashboard/Profile";

// Public & Marketing
import HomePage from "./pages/common/Homepage";
import ComingSoon from "./pages/common/ComingSoon";
import PaymentSuccess from "./pages/common/PaymentSuccess";

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
            style: { 
                background: "#1C1D24", 
                color: "#fff", 
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            } 
        }} 
      />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Core catalog routes */}
        <Route path="/course-showcase" element={<CourseShowcase />} />
        <Route path="/courses" element={<CourseShowcase />} />
        
        {/* Nav Links mapping */}
        <Route path="/learn" element={<CourseShowcase />} />
        <Route path="/tracks" element={<CourseShowcase />} />
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
            <InstructorStudio />
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
            <CourseEditor />
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
        <Route path="/certificate/:courseId" element={
          <ProtectedRoute>
            <CertificateViewer />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;