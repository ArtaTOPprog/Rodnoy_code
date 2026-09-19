// Соответствует Generated_Route.STATUS_CHOICES на бэкенде: pending / ready / failed
const LABELS = {
  pending: 'В обработке',
  ready: 'Готов',
  failed: 'Ошибка генерации',
}

const CLASSES = {
  pending: 'status-badge status-pending',
  ready: 'status-badge status-ready',
  failed: 'status-badge status-failed',
}

export default function StatusBadge({ status }) {
  return <span className={CLASSES[status] || 'status-badge'}>{LABELS[status] || status}</span>
}
