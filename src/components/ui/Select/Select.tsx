/**
 * Select Component
 * Styled select dropdown with label and error support
 */

import { forwardRef, type SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'required'> {
    /** Select label */
    label?: string;
    /** Options array */
    options: SelectOption[];
    /** Placeholder option */
    placeholder?: string;
    /** Error message */
    error?: string;
    /** Mark as required */
    required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, placeholder, error, required, className = '', ...props }, ref) => {
        const wrapperClasses = [
            styles.selectWrapper,
            error && styles.error,
            className,
        ]
            .filter(Boolean)
            .join(' ');

        const selectId = props.id || props.name;

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label htmlFor={selectId} className={`${styles.label} ${required ? styles.required : ''}`}>
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={styles.select}
                    aria-invalid={!!error}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value} disabled={option.disabled}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <span className={styles.errorMessage} role="alert">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
