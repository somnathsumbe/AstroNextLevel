import Button from './Button';

export default function IconButton({ label, className = '', children, ...props }) {
  return <Button variant="ghost" className={`ui-icon-button ${className}`.trim()} aria-label={label} title={label} {...props}>{children}</Button>;
}