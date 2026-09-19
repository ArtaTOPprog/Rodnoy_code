import { useState } from 'react'
import { updateProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telegram: user?.telegram || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateProfile(form)
      await refreshProfile()
      setSaved(true)
    } catch {
      setError('Не удалось сохранить изменения.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <main>
      <section>
        <div className="wrap auth-wrap">
          <div className="section-head">
            <h2>Профиль</h2>
            <p>Имя пользователя: {user.username} (изменить нельзя)</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span className="mock-label">Email</span>
              <input className="text-input" type="email" name="email" value={form.email} onChange={handleChange} />
            </label>
            <div className="form-row-2">
              <label className="form-field">
                <span className="mock-label">Имя</span>
                <input className="text-input" name="first_name" value={form.first_name} onChange={handleChange} />
              </label>
              <label className="form-field">
                <span className="mock-label">Фамилия</span>
                <input className="text-input" name="last_name" value={form.last_name} onChange={handleChange} />
              </label>
            </div>
            <div className="form-row-2">
              <label className="form-field">
                <span className="mock-label">Telegram</span>
                <input className="text-input" name="telegram" value={form.telegram} onChange={handleChange} />
              </label>
              <label className="form-field">
                <span className="mock-label">Телефон</span>
                <input className="text-input" name="phone" value={form.phone} onChange={handleChange} />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}
            {saved && <p className="route-summary">Изменения сохранены.</p>}

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
