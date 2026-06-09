import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { MyAppointmentsPage } from './pages/MyAppointmentsPage'
import { ReviewPage } from './pages/ReviewPage'
import { ProviderDashboardPage } from './pages/ProviderDashboardPage'
import { AvailabilitySettingsPage } from './pages/AvailabilitySettingsPage'
import { useAuth } from './context/authContext'

function App() {
  const { isAuthenticated, user } = useAuth()
  const isProvider = user?.role === 'Provider'

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isProvider ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <HomePage />
          )
        }
      />
      <Route
        path="/appointments"
        element={isAuthenticated ? <MyAppointmentsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/appointments/:appointmentId/review"
        element={isAuthenticated ? <ReviewPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <ProviderDashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/availability"
        element={isAuthenticated ? <AvailabilitySettingsPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
