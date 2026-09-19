import apiClient from './client'

// Соответствует QuestionnaireView (ModelViewSet) -> router.register('questionnaires', ...)
// Поля 'user' и 'created_at' на бэкенде read_only — их не нужно (и нельзя) передавать,
// сервер сам подставит текущего пользователя (QuestionnaireView.perform_create).
export async function createQuestionnaire(payload) {
  const { data } = await apiClient.post('/questionnaires/', payload)
  return data
}

export async function listQuestionnaires() {
  const { data } = await apiClient.get('/questionnaires/')
  return data.results ?? data // на случай, если пагинация будет отключена
}
