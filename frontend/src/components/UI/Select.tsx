import { forwardRef, type SelectHTMLAttributes } from 'react';
import type { AvailabilityOption } from '../../types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: AvailabilityOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      value,
      onChange,
      options = [],
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const selectId =
      id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <>
        {label && (
          <label className="field-label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </>
    );
  }
);

export default Select;
