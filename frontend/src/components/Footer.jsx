import logo from '../assets/images/img-1.png'

export default function Footer() {
  return (
    <footer id="contacts">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={logo} alt="Родной Код" />
            <span>Родной Код</span>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <div className="col-title">Разделы</div>
              <a href="/#how">Как это работает</a>
              <a href="/#service">Примеры маршрутов</a>
              <a href="/#about">О проекте</a>
              <a href="/#faq">FAQ</a>
            </div>
            <div className="footer-col">
              <div className="col-title">Контакты</div>
              <a href="mailto:rod-code@mail.ru">rod-code@mail.ru</a>
              <a href="#">Telegram проекта</a>
              <a href="/questionnaire">Заполнить анкету</a>
            </div>
            <div className="footer-col">
              <div className="col-title">Информация</div>
              <a href="#">Политика конфиденциальности</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Родной Код</span>
          <span>Персональные культурные маршруты по России</span>
        </div>
      </div>
    </footer>
  )
}
