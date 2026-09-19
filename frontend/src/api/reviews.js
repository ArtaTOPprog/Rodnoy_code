import apiClient from './client'

// Соответствует ReviewView (ModelViewSet) -> router.register('reviews', ...)
// generated_route обязательно должен принадлежать текущему пользователю —
// иначе сериализатор на бэкенде отклонит запрос (validate_generated_route, защита от IDOR).
export async function createReview({ generatedRouteId, text, rating, image }) {
  // Если есть файл изображения — нужен multipart/form-data, а не обычный JSON,
  // иначе ImageField на бэкенде не примет файл.
  if (image) {
    const formData = new FormData()
    formData.append('generated_route', generatedRouteId)
    formData.append('text', text)
    formData.append('rating', rating)
    formData.append('image', image)
    const { data } = await apiClient.post('/reviews/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  const { data } = await apiClient.post('/reviews/', {
    generated_route: generatedRouteId,
    text,
    rating,
  })
  return data
}

export async function listReviews() {
  const { data } = await apiClient.get('/reviews/')
  return data.results ?? data
}
