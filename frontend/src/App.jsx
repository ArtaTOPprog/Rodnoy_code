import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Questionnaire from './pages/Questionnaire'
import MyRoutes from './pages/MyRoutes'
import RouteDetail from './pages/RouteDetail'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Анкету можно открыть без входа — авторизация запрашивается
            только в момент отправки (см. Questionnaire.jsx). */}
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route
          path="/routes"
          element={
            <ProtectedRoute>
              <MyRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/routes/:id"
          element={
            <ProtectedRoute>
              <RouteDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}
