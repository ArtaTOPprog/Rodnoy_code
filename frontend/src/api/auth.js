import apiClient, { tokenStorage } from './client'

// Соответствует RegisterUser (APIView) -> app/urls.py: path('register/', ...)
// Бэкенд сам создаёт JWT-пару и возвращает её вместе с данными пользователя.
export async function registerUser(payload) {
  const { data } = await apiClient.post('/register/', payload)
  tokenStorage.setTokens(data.access, data.refresh)
  return data.user
}

// Соответствует TokenObtainPairView (simplejwt) -> path('token/', ...)
// Важно: simplejwt по умолчанию ожидает поле именно "username", не "email".
export async function loginUser({ username, password }) {
  const { data } = await apiClient.post('/token/', { username, password })
  tokenStorage.setTokens(data.access, data.refresh)
}

export function logoutUser() {
  tokenStorage.clear()
}

export function isAuthenticated() {
  return Boolean(tokenStorage.getAccess())
}
