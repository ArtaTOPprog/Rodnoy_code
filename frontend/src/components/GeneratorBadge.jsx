const LABELS = {
  openai: 'Составлен ИИ (OpenAI)',
  catalog: 'Подбор по каталогу',
}

const HINTS = {
  openai: 'Описание и заметки к местам написала модель OpenAI на основе вашей анкеты и мест из каталога',
  catalog: 'Маршрут собран из каталога проверенных мест без участия ИИ',
}

export default function GeneratorBadge({ generator }) {
  if (!LABELS[generator]) return null
  return (
    <span className={`generator-badge generator-${generator}`} title={HINTS[generator]}>
      {LABELS[generator]}
    </span>
  )
}
