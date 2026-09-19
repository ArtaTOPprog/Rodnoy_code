import { Link } from 'react-router-dom'
import heroPhoto from '../assets/images/img-3.jpg'
import serviceInterests from '../assets/images/img-4.jpg'
import serviceMap from '../assets/images/img-5.jpg'
import servicePlace from '../assets/images/img-6.jpg'
import serviceApp from '../assets/images/img-7.jpg'
import reviewAnna from '../assets/images/img-8.jpg'
import reviewDmitry from '../assets/images/img-9.jpg'
import aboutPhoto from '../assets/images/img-10.jpg'

export default function Landing() {
  return (
    <main id="top">
      {/* ================= HERO ================= */}
      <section className="hero" style={{ padding: 0 }}>
        <div className="hero-copy">
          <h1>Персональный культурный маршрут по России — под ваши интересы</h1>
          <p className="lede">
            Ответьте на несколько вопросов, и мы соберём для вас маршрут с атмосферными местами,
            локальными достопримечательностями и культурными точками, которые действительно стоит увидеть.
          </p>
          <div className="trust-line">
            <span className="dot"></span> Сейчас тестируем сервис — первые маршруты создаём бесплатно
          </div>
          <Link className="btn btn-primary" to="/questionnaire">
            Получить персональный маршрут
          </Link>
          <span className="btn-note on-dark">Займёт 2–3 минуты</span>
        </div>
        <div className="hero-photo">
          <img src={heroPhoto} alt="Подготовка к путешествию по России: карты, билеты, снаряжение" />
        </div>
      </section>

      <div className="wave-divider">
        <svg viewBox="0 0 220 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 8 C 30 -2, 60 18, 90 8 S 150 -2, 180 8 S 210 18, 220 8" />
        </svg>
      </div>

      {/* ================= PROBLEM ================= */}
      <section id="problem">
        <div className="wrap">
          <div className="section-head">
            <h2>Почему планировать поездку сложно?</h2>
            <p>
              Перед поездкой приходится открывать десятки вкладок, читать статьи, искать маршруты на
              картах — и всё равно не быть уверенным, что выбрали лучшее. Мы сделали сервис, который
              собирает маршрут под вас.
            </p>
          </div>
          <div className="problem-grid">
            <div className="problem-item">
              <span className="mark"></span>
              <p>Слишком много информации — сложно выбрать главное</p>
            </div>
            <div className="problem-item">
              <span className="mark"></span>
              <p>Типовые подборки повторяются от сайта к сайту</p>
            </div>
            <div className="problem-item">
              <span className="mark"></span>
              <p>Маршрут приходится собирать вручную</p>
            </div>
            <div className="problem-item">
              <span className="mark"></span>
              <p>На планирование уходит несколько часов</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICE ================= */}
      <section id="service" className="bg-linen">
        <div className="wrap">
          <div className="section-head">
            <h2>Мы собираем маршрут под вас, а не для всех сразу</h2>
            <p>
              Вы рассказываете, что вам интересно — архитектура, музеи, локальная культура,
              гастрономия или атмосферные прогулки. Мы подбираем маршрут именно под ваш формат поездки.
            </p>
          </div>
          <div className="service-grid four">
            <figure className="service-card tall service-1">
              <div className="frame">
                <img src={serviceInterests} alt="Подбор мест по интересам: музеи, хайкинг, рыбалка, театры" />
              </div>
              <figcaption>Подбор мест по вашим интересам</figcaption>
            </figure>
            <figure className="service-card wide service-2">
              <div className="frame">
                <img src={serviceMap} alt="Продуманная логика маршрута на карте" />
              </div>
              <figcaption>Логичный маршрут без лишних перемещений</figcaption>
            </figure>
            <figure className="service-card wide service-3">
              <div className="frame">
                <img src={servicePlace} alt="Неочевидное атмосферное место — дворик с музыкантами" />
              </div>
              <figcaption>Неочевидные культурные точки региона</figcaption>
            </figure>
            <figure className="service-card tall service-4">
              <div className="frame">
                <img src={serviceApp} alt="Готовый план поездки в приложении" />
              </div>
              <figcaption>Готовый сценарий поездки на 1–3 дня</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how">
        <div className="wrap">
          <div className="section-head">
            <h2>Как получить маршрут</h2>
          </div>
          <div className="route">
            <div className="route-step">
              <div className="num">1</div>
              <h3>Короткая анкета</h3>
              <p>Вы отвечаете на несколько вопросов о поездке и своих интересах</p>
            </div>
            <div className="route-step">
              <div className="num">2</div>
              <h3>Сборка маршрута</h3>
              <p>Мы анализируем интересы и собираем маршрут автоматически</p>
            </div>
            <div className="route-step">
              <div className="num">3</div>
              <h3>Готовый план</h3>
              <p>Вы получаете готовый план поездки прямо в личном кабинете</p>
            </div>
          </div>
          <p className="route-caption">Обычно маршрут готов в течение нескольких минут</p>
        </div>
      </section>

      {/* ================= WHY MANUAL ================= */}
      <section className="bg-linen">
        <div className="wrap">
          <div className="why-manual">
            <blockquote>
              Сейчас мы тестируем сервис персональных культурных маршрутов и работаем с первой группой
              пользователей.
            </blockquote>
            <p>
              Нам важно понять, какие форматы поездок действительно востребованы. Поэтому мы постоянно
              дорабатываем алгоритм подбора мест, чтобы рекомендации становились точнее и полезнее.
            </p>
            <span className="free-note">Участие в тестировании бесплатное</span>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section id="reviews">
        <div className="wrap">
          <div className="section-head">
            <h2>Как пользователи уже используют маршруты «Родного Кода»</h2>
            <p>
              Мы собираем обратную связь от первых пользователей, чтобы сделать сервис максимально
              полезным.
            </p>
          </div>

          <div className="review-list">
            <div className="review">
              <div className="review-photo">
                <img src={reviewAnna} alt="Анна из Москвы на смотровой площадке в Нижнем Новгороде" />
              </div>
              <div className="review-body">
                <div className="review-who">
                  <span className="review-name">Анна, Москва</span>
                  <span className="review-trip">поездка в Нижний Новгород на выходные</span>
                </div>
                <p className="review-text">
                  «Я планировала короткую поездку на выходные и не хотела тратить несколько вечеров на
                  поиск маршрута. В анкете отметила, что мне интересны архитектура, небольшие музеи и
                  атмосферные прогулки без толп туристов. В маршруте мне предложили прогулку по
                  Верхневолжской набережной, посещение Арсенала в Нижегородском кремле, несколько
                  локальных выставочных пространств и дворики исторического центра, о которых я раньше
                  не знала.»
                </p>
                <div className="review-result">Результат: поездка без подготовки</div>
              </div>
            </div>

            <div className="review">
              <div className="review-photo">
                <img src={reviewDmitry} alt="Дмитрий из Санкт-Петербурга на фоне гор в Кисловодске" />
              </div>
              <div className="review-body">
                <div className="review-who">
                  <span className="review-name">Дмитрий, Санкт-Петербург</span>
                  <span className="review-trip">поездка в Кисловодск</span>
                </div>
                <p className="review-text">
                  «Я поехал в Кисловодск без чёткого плана — знал только, что хочу много гулять и
                  посмотреть природу вокруг города. Здесь получилось иначе: мне заранее предложили
                  маршрут на несколько дней с понятной последовательностью.»
                </p>
                <div className="review-result">Результат: 3 дня без хаоса</div>
              </div>
            </div>

            <div className="review">
              <div className="review-photo avatar">МБ</div>
              <div className="review-body">
                <div className="review-who">
                  <span className="review-name">Мария, Балашиха</span>
                  <span className="review-trip">семейная поездка в Адыгею</span>
                </div>
                <p className="review-text">
                  «Я давно хотела поехать в Адыгею вместе с семьёй, но не понимала, как лучше построить
                  маршрут. Нам предложили маршрут на три дня, и в итоге поездка получилась очень
                  цельной — всей семьёй очень понравилось.»
                </p>
                <div className="review-result">Результат: готовый план на 3 дня</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO FOR ================= */}
      <section className="bg-linen">
        <div className="wrap">
          <div className="section-head">
            <h2>Кому подойдёт Родной Код</h2>
          </div>
          <ul className="who-list">
            <li>Тем, кто хочет увидеть регион глубже, чем через стандартные маршруты</li>
            <li>Тем, кто не хочет тратить несколько часов на планирование поездки</li>
            <li>Тем, кто любит культурные путешествия по России</li>
            <li>Тем, кто ищет идеи для поездки на выходные</li>
            <li>Тем, кто хочет открыть новые места без случайного выбора</li>
          </ul>
        </div>
      </section>

      {/* ================= OFFER ================= */}
      <section className="bg-pine offer">
        <div className="wrap">
          <div className="offer-inner">
            <h2>Получите маршрут под свою поездку</h2>
            <p>
              Заполните анкету — мы подготовим персональный культурный маршрут с учётом ваших
              интересов, формата путешествия и длительности поездки. Сейчас участие в тестировании
              бесплатное.
            </p>
            <Link className="btn btn-outline" to="/questionnaire">
              Заполнить анкету
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about">
        <div className="wrap">
          <div className="about">
            <div className="about-photo">
              <img src={aboutPhoto} alt="Планирование маршрута по карте России" />
            </div>
            <div className="about-copy">
              <h2>О проекте Родной Код</h2>
              <p>
                Родной Код — это сервис персональных культурных маршрутов по регионам России. Мы
                помогаем путешественникам открывать локальные культурные пространства, музеи и
                атмосферные места без долгого поиска информации.
              </p>
              <p>Сейчас проект находится на этапе тестирования и развивается вместе с первыми пользователями.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="bg-linen">
        <div className="wrap">
          <div className="section-head">
            <h2>Ответы на вопросы</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>
                Это бесплатно?<span className="plus"></span>
              </summary>
              <p>Да. Сейчас маршруты создаются бесплатно для участников тестирования.</p>
            </details>
            <details>
              <summary>
                Когда я получу маршрут?<span className="plus"></span>
              </summary>
              <p>Обычно в течение нескольких минут после заполнения анкеты.</p>
            </details>
            <details>
              <summary>
                Нужно устанавливать приложение?<span className="plus"></span>
              </summary>
              <p>Нет. Маршрут появляется прямо в личном кабинете на сайте.</p>
            </details>
            <details>
              <summary>
                Можно заказать маршрут в любой регион?<span className="plus"></span>
              </summary>
              <p>Да. Мы подбираем маршруты по разным направлениям внутри России.</p>
            </details>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="final-cta">
        <div className="wrap">
          <div className="section-head center">
            <h2>Попробуйте персональный маршрут для своей поездки</h2>
            <p>Ответьте на несколько вопросов — мы подготовим рекомендации именно под ваш формат путешествия.</p>
          </div>
          <Link className="btn btn-primary" to="/questionnaire">
            Получить маршрут
          </Link>
        </div>
      </section>
    </main>
  )
}
