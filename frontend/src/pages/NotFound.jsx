import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main>
      <section className="wrap">
        <div className="section-head center">
          <h2>Страница не найдена</h2>
          <p>Похоже, такой страницы не существует.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link className="btn btn-primary" to="/">
            На главную
          </Link>
        </div>
      </section>
    </main>
  )
}
