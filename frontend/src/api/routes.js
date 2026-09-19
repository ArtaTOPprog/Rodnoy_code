import apiClient from './client'

// Соответствует Generated_RouteView (ModelViewSet) -> router.register('routes', ...)
// При создании бэкенд сам ставит status='pending' и вызывает generate_itinerary.delay(),
// поэтому здесь нужно передать только questionnaire (id анкеты) и, по желанию, title/даты.
export async function createRoute(payload) {
  const { data } = await apiClient.post('/routes/', payload)
  return data
}

export async function listRoutes() {
  const { data } = await apiClient.get('/routes/')
  return data.results ?? data
}

export async function getRoute(id) {
  const { data } = await apiClient.get(`/routes/${id}/`)
  return data
}

// Соответствует @action(detail=True, methods=['get']) status на Generated_RouteView.
// Используется для поллинга, пока Celery-задача генерирует маршрут в фоне.
export async function getRouteStatus(id) {
  const { data } = await apiClient.get(`/routes/${id}/status/`)
  return data
}
