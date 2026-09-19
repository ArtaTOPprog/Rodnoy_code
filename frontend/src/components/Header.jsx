import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/images/img-1.png'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header>
      <div className="wrap nav-row">
        <Link className="brand" to="/">
          <img src={logo} alt="Родной Код" />
          <span className="brand-word">Родной Код</span>
        </Link>

        <nav className="primary-nav">
          <a href="/#how">Как это работает?</a>
          <a href="/#service">Примеры маршрутов</a>
          <a href="/#about">О проекте</a>
          <a href="/#faq">FAQ</a>
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <Link className="btn btn-line" to="/routes">
                Мои маршруты
              </Link>
              <Link className="btn btn-line" to="/profile">
                {user.username}
              </Link>
              <button className="btn btn-outline-dark" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-line" to="/login">
                Войти
              </Link>
              <Link className="btn btn-primary" to="/questionnaire">
                Получить маршрут
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
