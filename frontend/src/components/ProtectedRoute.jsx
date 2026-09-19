import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    // Пока идёт проверка токена — ничего не показываем, чтобы не мигал логин.
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
