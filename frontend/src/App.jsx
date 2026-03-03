import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CompletePasswordPage from './pages/CompletePasswordPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import PreferencesPage from './pages/PreferencesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import CreateProjectPage from './pages/CreateProjectPage'
import EditProjectPage from './pages/EditProjectPage'
import StudentFormPage from './pages/StudentFormPage'
import StudentExchangePreferences from './pages/StudentExchangePreferences'
import MyPreferences from './pages/MyPreferences'
import MyAssignments from './pages/MyAssignments'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="complete-password" element={<CompletePasswordPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            
            {/* Student Routes */}
            <Route 
              path="student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="preferences" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PreferencesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-preferences" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyPreferences />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-assignments" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyAssignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/exchange-preferences/:projectId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentExchangePreferences />
                </ProtectedRoute>
              } 
            />
            
            {/* Teacher Routes */}
            <Route 
              path="teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/create-project" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <CreateProjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/edit-project/:projectId" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <EditProjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/assignments/:projectId" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AssignmentsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Routes - require login but any role */}
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="projects" 
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="projects/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectDetailsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Form Route - public link with project ID */}
            <Route 
              path="form/:projectId" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentFormPage />
                </ProtectedRoute>
              } 
            />

            {/* 404 catch-all */}
            <Route path="*" element={
              <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
                <p className="text-slate-500 mb-6">Page introuvable</p>
                <a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
