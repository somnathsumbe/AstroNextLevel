const variants = {
  primary: 'gold-action',
  secondary: 'subtle-action',
  outline: 'outline-action',
  ghost: 'ui-button-ghost',
  danger: 'ui-button-danger',
};

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', children, ...props }) {
  return <button type={type} className={`ui-button ui-button-${size} ${variants[variant] || variants.primary} ${className}`.trim()} {...props}>{children}</button>;
}