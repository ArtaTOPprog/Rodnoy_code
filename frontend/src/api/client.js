import axios from 'axios'

// Базовый адрес API — соответствует ROOT_URLCONF -> path('api/', include('app.urls'))
// в вашем backend-проекте.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Ключи в localStorage — единое место, чтобы не разбросать имена по всему проекту.
const ACCESS_TOKEN_KEY = 'rodnoy_access_token'
const REFRESH_TOKEN_KEY = 'rodnoy_refresh_token'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Подставляем access-токен в каждый запрос, если он есть.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Отдельный "чистый" клиент без интерцепторов — нужен для запроса обновления
// токена, чтобы не зациклиться (иначе перехватчик ответа сам попытался бы
// обновить токен для запроса, который сам и обновляет токен).
const rawClient = axios.create({ baseURL: API_BASE_URL })

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) throw new Error('Нет refresh-токена')

  // Если несколько запросов одновременно получили 401 — обновляем токен
  // только один раз, а не по разу на каждый запрос.
  if (!refreshPromise) {
    refreshPromise = rawClient
      .post('/token/refresh/', { refresh })
      .then((res) => {
        tokenStorage.setTokens(res.data.access, null)
        return res.data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Если пришёл 401 и это не повторная попытка — пробуем обновить токен.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newAccess = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh-токен тоже недействителен — разлогиниваем пользователя.
        tokenStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
