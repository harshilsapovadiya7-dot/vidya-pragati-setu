import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from './components/ui/toaster';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SchemesPage } from './pages/public/SchemesPage';
import { SchemeDetailPage } from './pages/public/SchemeDetailPage';
import { HelpPage } from './pages/public/HelpPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { SchemeDiscovery } from './pages/student/SchemeDiscovery';
import { MyApplications } from './pages/student/MyApplications';
import { ApplicationDetail } from './pages/student/ApplicationDetail';
import { ApplicationWizard } from './pages/student/ApplicationWizard';
import { MyDocuments } from './pages/student/MyDocuments';
import { BenefitsTracking } from './pages/student/BenefitsTracking';
import { Notifications } from './pages/student/Notifications';

// School Pages
import { SchoolDashboard } from './pages/school/SchoolDashboard';
import { SchoolStudents } from './pages/school/SchoolStudents';
import { SchoolApplications } from './pages/school/SchoolApplications';
import { SchoolDocuments } from './pages/school/SchoolDocuments';
import { SchoolAssets } from './pages/school/SchoolAssets';

// District Pages
import { DistrictDashboard } from './pages/district/DistrictDashboard';
import { DistrictApplications } from './pages/district/DistrictApplications';
import { DistrictSchools } from './pages/district/DistrictSchools';
import { DistrictAssets } from './pages/district/DistrictAssets';
import { DistrictReports } from './pages/district/DistrictReports';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSchemes } from './pages/admin/AdminSchemes';
import { AdminRules } from './pages/admin/AdminRules';
import { AdminDistricts } from './pages/admin/AdminDistricts';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminAssets } from './pages/admin/AdminAssets';
import { AdminReports } from './pages/admin/AdminReports';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>

          {/* Protected Student Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/discovery" element={<SchemeDiscovery />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/applications/:id" element={<ApplicationDetail />} />
            <Route path="/student/apply/:schemeId" element={<ApplicationWizard />} />
            <Route path="/student/documents" element={<MyDocuments />} />
            <Route path="/student/benefits" element={<BenefitsTracking />} />
            <Route path="/student/notifications" element={<Notifications />} />
          </Route>

          {/* Protected School Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/school/dashboard" element={<SchoolDashboard />} />
            <Route path="/school/students" element={<SchoolStudents />} />
            <Route path="/school/applications" element={<SchoolApplications />} />
            <Route path="/school/documents" element={<SchoolDocuments />} />
            <Route path="/school/assets" element={<SchoolAssets />} />
          </Route>

          {/* Protected District Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['DISTRICT_OFFICER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/district/dashboard" element={<DistrictDashboard />} />
            <Route path="/district/applications" element={<DistrictApplications />} />
            <Route path="/district/schools" element={<DistrictSchools />} />
            <Route path="/district/assets" element={<DistrictAssets />} />
            <Route path="/district/reports" element={<DistrictReports />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['STATE_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/schemes" element={<AdminSchemes />} />
            <Route path="/admin/rules" element={<AdminRules />} />
            <Route path="/admin/districts" element={<AdminDistricts />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/assets" element={<AdminAssets />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/audit" element={<AuditLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
