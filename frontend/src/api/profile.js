import apiClient from './client'

// Соответствует ProfileView (APIView) -> path('profile/', ...)
// request.user на бэкенде сам определяет владельца по JWT — ID никогда
// не передаётся с фронта, поэтому получить/изменить чужой профиль нельзя.
export async function getProfile() {
  const { data } = await apiClient.get('/profile/')
  return data
}

export async function updateProfile(payload) {
  const { data } = await apiClient.patch('/profile/', payload)
  return data
}
