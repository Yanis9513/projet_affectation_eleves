import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import PreferencesPage from './pages/PreferencesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import CreateProjectPage from './pages/CreateProjectPage'
import EditProjectPage from './pages/EditProjectPage'
import StudentFormPage from './pages/StudentFormPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            
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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
