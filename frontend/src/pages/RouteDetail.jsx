import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRoute, getRouteStatus } from '../api/routes'
import { createReview } from '../api/reviews'
import StatusBadge from '../components/StatusBadge'

const POLL_INTERVAL_MS = 3000

export default function RouteDetail() {
  const { id } = useParams()
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pollTimer = useRef(null)

  const fetchFullRoute = useCallback(async () => {
    const data = await getRoute(id)
    setRoute(data)
    return data
  }, [id])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const data = await fetchFullRoute()
        if (!cancelled && data.status === 'pending') {
          startPolling()
        }
      } catch {
        if (!cancelled) setError('Не удалось загрузить маршрут.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    function startPolling() {
      pollTimer.current = setInterval(async () => {
        try {
          const statusData = await getRouteStatus(id)
          if (statusData.status !== 'pending') {
            clearInterval(pollTimer.current)
            // Статус сменился на ready/failed — подгружаем полные данные
            // (эндпоинт status не отдаёт places, только id/status/full_text).
            fetchFullRoute()
          }
        } catch {
          clearInterval(pollTimer.current)
        }
      }, POLL_INTERVAL_MS)
    }

    init()
    return () => {
      cancelled = true
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [id, fetchFullRoute])

  if (loading) {
    return (
      <main>
        <section className="wrap">
          <p>Загрузка маршрута…</p>
        </section>
      </main>
    )
  }

  if (error || !route) {
    return (
      <main>
        <section className="wrap">
          <p className="form-error">{error || 'Маршрут не найден.'}</p>
          <Link className="btn btn-line" to="/routes">
            К списку маршрутов
          </Link>
        </section>
      </main>
    )
  }

  const placesByDay = groupByDay(route.places || [])

  return (
    <main>
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="route-detail-head">
              <h2>{route.title || 'Маршрут без названия'}</h2>
              <StatusBadge status={route.status} />
            </div>
            {route.description && <p>{route.description}</p>}
          </div>

          {route.status === 'pending' && (
            <div className="empty-state">
              <p>Маршрут ещё генерируется — это обычно занимает не больше пары минут. Страница обновится автоматически.</p>
            </div>
          )}

          {route.status === 'failed' && (
            <div className="empty-state">
              <p>Не удалось сгенерировать маршрут по этой анкете. Попробуйте заполнить анкету ещё раз с другими параметрами.</p>
              <Link className="btn btn-primary" to="/questionnaire">
                Заполнить анкету заново
              </Link>
            </div>
          )}

          {route.status === 'ready' && (
            <>
              {route.full_text && <p className="route-summary">{route.full_text}</p>}

              {Object.keys(placesByDay).length === 0 && <p>Для этого маршрута не нашлось подходящих мест.</p>}

              {Object.entries(placesByDay).map(([day, places]) => (
                <div key={day} className="route-day">
                  <h3>День {day}</h3>
                  <ul className="route-day-places">
                    {places.map((item) => (
                      <li key={item.id} className="route-place">
                        <div className="route-place-name">{item.place?.name}</div>
                        {item.place?.description && <p className="route-place-desc">{item.place.description}</p>}
                        {item.notes && <p className="route-place-notes">{item.notes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <ReviewForm routeId={route.id} />
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function groupByDay(places) {
  return places.reduce((acc, item) => {
    const day = item.day_number
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {})
}

function ReviewForm({ routeId }) {
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createReview({ generatedRouteId: routeId, text, rating })
      setDone(true)
    } catch {
      setError('Не удалось отправить отзыв. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return <p className="route-summary">Спасибо за отзыв!</p>
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Оставить отзыв о маршруте</h3>
      <label className="form-field">
        <span className="mock-label">Оценка</span>
        <select className="text-input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span className="mock-label">Комментарий</span>
        <textarea
          className="text-input"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-line" type="submit" disabled={submitting}>
        {submitting ? 'Отправляем…' : 'Отправить отзыв'}
      </button>
    </form>
  )
}
