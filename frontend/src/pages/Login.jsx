import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form)
      navigate('/routes')
    } catch (err) {
      // TokenObtainPairView при неверных данных возвращает 401 с detail.
      if (err.response?.status === 401) {
        setError('Неверное имя пользователя или пароль.')
      } else {
        setError('Не удалось войти. Попробуйте ещё раз.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <section className="auth-section">
        <div className="wrap auth-wrap">
          <div className="section-head">
            <h2>Вход</h2>
            <p>Войдите, чтобы увидеть свои маршруты и анкету.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span className="mock-label">Имя пользователя</span>
              <input
                className="text-input"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>
            <label className="form-field">
              <span className="mock-label">Пароль</span>
              <input
                className="text-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Входим…' : 'Войти'}
            </button>
          </form>

          <p className="auth-switch">
            Ещё нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
