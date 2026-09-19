import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  telegram: '',
  phone: '',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await register(form)
      navigate('/questionnaire')
    } catch (err) {
      // DRF при ошибках валидации возвращает объект вида {field: [сообщения]}
      // — например {"username": ["уже занят"], "password": ["слишком простой"]}.
      if (err.response?.data) {
        setErrors(err.response.data)
      } else {
        setErrors({ non_field_errors: ['Не удалось зарегистрироваться. Попробуйте ещё раз.'] })
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
            <h2>Регистрация</h2>
            <p>Создайте аккаунт, чтобы получить и сохранить свой персональный маршрут.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <FormField label="Имя пользователя" name="username" value={form.username} onChange={handleChange} required errors={errors.username} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} errors={errors.email} />
            <FormField label="Пароль" name="password" type="password" value={form.password} onChange={handleChange} required errors={errors.password} />
            <div className="form-row-2">
              <FormField label="Имя" name="first_name" value={form.first_name} onChange={handleChange} errors={errors.first_name} />
              <FormField label="Фамилия" name="last_name" value={form.last_name} onChange={handleChange} errors={errors.last_name} />
            </div>
            <div className="form-row-2">
              <FormField label="Telegram" name="telegram" value={form.telegram} onChange={handleChange} errors={errors.telegram} />
              <FormField label="Телефон" name="phone" value={form.phone} onChange={handleChange} errors={errors.phone} />
            </div>

            {errors.non_field_errors && <p className="form-error">{errors.non_field_errors.join(' ')}</p>}

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="auth-switch">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

function FormField({ label, name, value, onChange, type = 'text', required, errors }) {
  return (
    <label className="form-field">
      <span className="mock-label">{label}</span>
      <input
        className="text-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
      {errors && <span className="form-error">{errors.join(' ')}</span>}
    </label>
  )
}
