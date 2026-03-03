import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import React from 'react'
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Une erreur est survenue</h1>
            <p className="text-slate-600 mb-6">
              {this.state.error?.message || "L'application a rencontré un problème inattendu."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// 404 Not Found page
function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-6">Page non trouvée</p>
        <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
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
            
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
