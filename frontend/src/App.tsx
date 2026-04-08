import { Routes, Route, Navigate } from 'react-router-dom';
import AcademyExplorePage from './modules/academy/pages/AcademyExplorePage';
import AcademyHomePage from './modules/academy/pages/AcademyHomePage';
import CourseDetailPage from './modules/academy/pages/CourseDetailPage';
import LessonPage from './modules/academy/pages/LessonPage';
import ProfilePage from './modules/academy/pages/ProfilePage';
import LeaderDashboardPage from './modules/academy/pages/LeaderDashboardPage';
import NDataPage from './modules/academy/pages/NDataPage';
import CmsCoursesPage from './modules/academy/pages/cms/CmsCoursesPage';

export default function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/academy" replace />} />

      {/* Academy routes */}
      <Route path="/academy" element={<AcademyExplorePage />} />
      <Route path="/training" element={<AcademyHomePage />} />
      <Route path="/training/courses/:slug" element={<CourseDetailPage />} />
      <Route path="/training/lessons/:lessonId" element={<LessonPage />} />
      <Route path="/training/profile" element={<ProfilePage />} />
      <Route path="/training/dashboard" element={<LeaderDashboardPage />} />
      <Route path="/training/ndata" element={<NDataPage />} />
      <Route path="/cms/courses" element={<CmsCoursesPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/academy" replace />} />
    </Routes>
  );
}
