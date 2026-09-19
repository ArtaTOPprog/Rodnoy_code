import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createQuestionnaire } from '../api/questionnaire'
import { createRoute } from '../api/routes'
import { useAuth } from '../context/AuthContext'

// Списки вариантов для чекбоксов — соответствуют полям типа JSONField(default=list)
// в модели Questionnaire (interes, format_travel, unwanted, value_proposition).
const INTERESTS = ['Архитектура', 'Музеи', 'Локальная культура', 'Гастрономия', 'Природа', 'Атмосферные прогулки']
const FORMATS = ['Пеший', 'Автомобильный', 'Смешанный']
const UNWANTED = ['Толпы туристов', 'Долгие переезды', 'Дорогие места']
const VALUE_PROPS = ['Экономия времени', 'Неочевидные места', 'Персонализация', 'Логичный маршрут']

const STEPS = ['Поездка', 'Интересы', 'Формат', 'Предпочтения', 'Итог']

const initialForm = {
  region: '',
  travel_date: '',
  duration_days: '',
  companions: '',
  interes: [],
  format_travel: [],
  unwanted: [],
  planning_time: '',
  planning_tools: '',
  importance_personalization: '',
  value_proposition: [],
  to_pay: '',
  ideal_route: '',
}

export default function Questionnaire() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleCheckbox(name, option) {
    setForm((prev) => {
      const current = prev[name]
      const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option]
      return { ...prev, [name]: next }
    })
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    // Анкету можно заполнить анонимно, но для сохранения маршрута нужен
    // аккаунт — на бэкенде и Questionnaire, и Generated_Route требуют
    // авторизованного пользователя (IsAuthenticated).
    if (!user) {
      navigate('/register', { state: { pendingQuestionnaire: form } })
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const questionnaire = await createQuestionnaire(form)
      const route = await createRoute({
        questionnaire: questionnaire.id,
        title: `Маршрут: ${form.region || 'без названия'}`,
      })
      navigate(`/routes/${route.id}`)
    } catch (err) {
      setError('Не удалось отправить анкету. Проверьте поля и попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <section className="questionnaire-section">
        <div className="wrap auth-wrap">
          <div className="section-head">
            <h2>Анкета — 2–3 минуты</h2>
            <p>Шаг {step + 1} из {STEPS.length} — {STEPS[step]}</p>
          </div>

          <div className="progress-mock">
            {STEPS.map((_, i) => (
              <span key={i} className={i <= step ? 'done' : ''}></span>
            ))}
          </div>

          <div className="questionnaire-card">
            {step === 0 && (
              <div className="form-step">
                <label className="form-field">
                  <span className="mock-label">Регион / город</span>
                  <input
                    className="text-input"
                    value={form.region}
                    onChange={(e) => updateField('region', e.target.value)}
                    placeholder="Например, Нижний Новгород"
                  />
                </label>
                <label className="form-field">
                  <span className="mock-label">Когда планируете поездку</span>
                  <input
                    className="text-input"
                    value={form.travel_date}
                    onChange={(e) => updateField('travel_date', e.target.value)}
                    placeholder="Например, в июне"
                  />
                </label>
                <label className="form-field">
                  <span className="mock-label">На сколько дней</span>
                  <input
                    className="text-input"
                    value={form.duration_days}
                    onChange={(e) => updateField('duration_days', e.target.value)}
                    placeholder="Например, 3"
                  />
                </label>
                <label className="form-field">
                  <span className="mock-label">С кем едете</span>
                  <input
                    className="text-input"
                    value={form.companions}
                    onChange={(e) => updateField('companions', e.target.value)}
                    placeholder="Например, с семьёй"
                  />
                </label>
              </div>
            )}

            {step === 1 && (
              <CheckboxGroup
                label="Что вам интересно?"
                options={INTERESTS}
                selected={form.interes}
                onToggle={(opt) => toggleCheckbox('interes', opt)}
              />
            )}

            {step === 2 && (
              <>
                <CheckboxGroup
                  label="Формат поездки"
                  options={FORMATS}
                  selected={form.format_travel}
                  onToggle={(opt) => toggleCheckbox('format_travel', opt)}
                />
                <CheckboxGroup
                  label="Чего не хочется в поездке?"
                  options={UNWANTED}
                  selected={form.unwanted}
                  onToggle={(opt) => toggleCheckbox('unwanted', opt)}
                />
              </>
            )}

            {step === 3 && (
              <div className="form-step">
                <label className="form-field">
                  <span className="mock-label">Сколько времени готовы тратить на планирование</span>
                  <input
                    className="text-input"
                    value={form.planning_time}
                    onChange={(e) => updateField('planning_time', e.target.value)}
                    placeholder="Например, минимум"
                  />
                </label>
                <label className="form-field">
                  <span className="mock-label">Чем обычно пользуетесь для планирования</span>
                  <input
                    className="text-input"
                    value={form.planning_tools}
                    onChange={(e) => updateField('planning_tools', e.target.value)}
                    placeholder="Например, блоги, карты"
                  />
                </label>
                <label className="form-field">
                  <span className="mock-label">Насколько важна персонализация</span>
                  <input
                    className="text-input"
                    value={form.importance_personalization}
                    onChange={(e) => updateField('importance_personalization', e.target.value)}
                    placeholder="Например, очень важна"
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <>
                <CheckboxGroup
                  label="Что для вас ценно в сервисе?"
                  options={VALUE_PROPS}
                  selected={form.value_proposition}
                  onToggle={(opt) => toggleCheckbox('value_proposition', opt)}
                />
                <label className="form-field">
                  <span className="mock-label">Готовность платить</span>
                  <input
                    className="text-input"
                    value={form.to_pay}
                    onChange={(e) => updateField('to_pay', e.target.value)}
                    placeholder="Например, готов(а) за расширенные функции"
                  />
                </label>
                <label className="form-field">
                  <span className="mock-label">Опишите идеальный маршрут (по желанию)</span>
                  <textarea
                    className="text-input"
                    rows={4}
                    value={form.ideal_route}
                    onChange={(e) => updateField('ideal_route', e.target.value)}
                  />
                </label>
              </>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-nav">
              {step > 0 && (
                <button className="btn btn-line" type="button" onClick={goBack}>
                  Назад
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary" type="button" onClick={goNext}>
                  Далее
                </button>
              ) : (
                <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Отправляем…' : 'Получить маршрут'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <fieldset className="checkbox-group">
      <legend className="mock-label">{label}</legend>
      {options.map((option) => (
        <label key={option} className="checkbox-option">
          <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  )
}
