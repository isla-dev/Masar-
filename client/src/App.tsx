import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes/guards';
import HomePage from './pages/HomePage';
import CertificatesInfoPage from './pages/certificate/CertificatesInfoPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicLayout from './layouts/PublicLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherCoursesListPage from './pages/teacher/TeacherCoursesListPage';
import CourseCreatePage from './pages/teacher/CourseCreatePage';
import CourseEditorPage from './pages/teacher/CourseEditorPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import LearnPage from './pages/LearnPage';
import QuizAttemptPage from './pages/quiz/QuizAttemptPage';
import AssignmentSubmitPage from './pages/assignment/AssignmentSubmitPage';
import AssignmentSubmissionsPage from './pages/teacher/AssignmentSubmissionsPage';
import VerifyCertificatePage from './pages/certificate/VerifyCertificatePage';
import ProfileSettingsPage from './pages/profile/ProfileSettingsPage';
import TeacherDashboardOverviewPage from './pages/teacher/TeacherDashboardOverviewPage';
import TeacherCourseStudentsPage from './pages/teacher/TeacherCourseStudentsPage';
import AdminLayout from './layouts/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminPendingCoursesPage from './pages/admin/AdminPendingCoursesPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import PaymentResultPage from './pages/payment/PaymentResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/certificates" element={<CertificatesInfoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:certificateNumber" element={<VerifyCertificatePage />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/profile" element={<ProfileSettingsPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard/student" element={<StudentDashboardPage />} />
              <Route path="/learn/:courseId" element={<LearnPage />} />
              <Route path="/quiz/:id" element={<QuizAttemptPage />} />
              <Route path="/assignment/:id" element={<AssignmentSubmitPage />} />
              <Route path="/payment/result" element={<PaymentResultPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allowedRoles={['teacher']} />}>
            <Route path="/dashboard/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboardOverviewPage />} />
              <Route path="courses" element={<TeacherCoursesListPage />} />
              <Route path="courses/new" element={<CourseCreatePage />} />
              <Route path="courses/:id" element={<CourseEditorPage />} />
              <Route path="courses/:id/students" element={<TeacherCourseStudentsPage />} />
              <Route path="assignments/:id/submissions" element={<AssignmentSubmissionsPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="courses/pending" element={<AdminPendingCoursesPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
