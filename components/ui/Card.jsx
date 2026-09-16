export function Card({ as: Element = 'section', className = '', children, ...props }) {
  return <Element className={`ui-card ${className}`.trim()} {...props}>{children}</Element>;
}

export function CardHeader({ title, description, action, className = '' }) {
  return <div className={`ui-card-header ${className}`.trim()}><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</div>;
}

export function CardBody({ className = '', children }) {
  return <div className={`ui-card-body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`ui-card-footer ${className}`.trim()}>{children}</div>;
}

export default Card;