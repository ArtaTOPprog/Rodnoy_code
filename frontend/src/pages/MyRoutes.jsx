import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRoutes } from '../api/routes'
import StatusBadge from '../components/StatusBadge'

export default function MyRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listRoutes()
      .then((data) => {
        if (!cancelled) setRoutes(data)
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить маршруты.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <section>
        <div className="wrap">
          <div className="section-head">
            <h2>Мои маршруты</h2>
            <p>Здесь появляются все маршруты, которые вы запросили через анкету.</p>
          </div>

          {loading && <p>Загрузка…</p>}
          {error && <p className="form-error">{error}</p>}

          {!loading && routes.length === 0 && (
            <div className="empty-state">
              <p>У вас пока нет ни одного маршрута.</p>
              <Link className="btn btn-primary" to="/questionnaire">
                Заполнить анкету
              </Link>
            </div>
          )}

          <div className="route-list-cards">
            {routes.map((route) => (
              <Link key={route.id} to={`/routes/${route.id}`} className="route-card">
                <div className="route-card-top">
                  <h3>{route.title || 'Маршрут без названия'}</h3>
                  <StatusBadge status={route.status} />
                </div>
                <p className="route-card-meta">
                  {route.duration_days ? `${route.duration_days} дн.` : ''}
                  {route.generated_at ? ` · создан ${new Date(route.generated_at).toLocaleDateString('ru-RU')}` : ''}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
