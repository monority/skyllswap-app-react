import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      id,
      type = 'text',
      value,
      onChange,
      placeholder,
      required,
      minLength,
      maxLength,
      autoComplete,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="form-field">
        {label && (
          <label
            className={`form-label ${required ? 'form-label--required' : ''}`}
            htmlFor={inputId}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`input ${className}`.trim()}
          {...props}
        />
        {hint && <span className="form-hint">{hint}</span>}
      </div>
    );
  }
);

export default Input;
