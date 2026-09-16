export default function ErrorState({ title = 'Unable to load data', description = 'Something went wrong while loading this module.', action, className = '' }) {
  return <div className={`ui-error-state ${className}`.trim()} role="alert"><i className="bi bi-exclamation-triangle" aria-hidden="true" /><strong>{title}</strong><span>{description}</span>{action}</div>;
}