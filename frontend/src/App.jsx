import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ProjectsPage from './pages/ProjectsPage'
import PreferencesPage from './pages/PreferencesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="student" element={<StudentDashboard />} />
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
