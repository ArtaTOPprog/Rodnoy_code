import apiClient from './client'

// Соответствует PlaceView (ReadOnlyModelViewSet, AllowAny) -> router.register('places', ...)
export async function listPlaces() {
  const { data } = await apiClient.get('/places/')
  return data.results ?? data
}

// Соответствует функции filter_places (@api_view, AllowAny) -> path('filter-places/', ...)
export async function filterPlaces({ region = '', interest = '' } = {}) {
  const { data } = await apiClient.get('/filter-places/', {
    params: { region, interest },
  })
  return data
}
