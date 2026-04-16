import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    disabled,
    loading,
    className = '',
    ...props
  },
  ref
) {
  const baseClass = variant === 'secondary' ? 'secondary' : '';

  return (
    <button
      ref={ref}
      type="button"
      className={`${baseClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
});

export default Button;
