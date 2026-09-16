export default function EmptyState({ icon = 'bi-inbox', title = 'No data found', description, action, className = '' }) {
  return <div className={`ui-empty-state ${className}`.trim()} role="status"><i className={`bi ${icon}`} aria-hidden="true" />{title && <strong>{title}</strong>}{description && <span>{description}</span>}{action}</div>;
}