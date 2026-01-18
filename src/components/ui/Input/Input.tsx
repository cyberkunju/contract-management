/**
 * Input Component
 * Reusable text input with label, error, and helper text support
 */

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface BaseInputProps {
    /** Input label */
    label?: string;
    /** Error message */
    error?: string;
    /** Helper text below input */
    helperText?: string;
    /** Mark as required */
    required?: boolean;
}

export interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'required'> {
    /** Render as textarea */
    as?: 'input';
}

export interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'> {
    /** Render as textarea */
    as: 'textarea';
}

type Props = InputProps | TextareaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, error, helperText, required, className = '', as = 'input', ...props }, ref) => {
        const wrapperClasses = [
            styles.inputWrapper,
            error && styles.error,
            className,
        ]
            .filter(Boolean)
            .join(' ');

        const inputClasses = [styles.input, as === 'textarea' && styles.textarea]
            .filter(Boolean)
            .join(' ');

        const inputId = props.id || props.name;

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label htmlFor={inputId} className={`${styles.label} ${required ? styles.required : ''}`}>
                        {label}
                    </label>
                )}
                {as === 'textarea' ? (
                    <textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        id={inputId}
                        className={inputClasses}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        id={inputId}
                        className={inputClasses}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        {...(props as InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}
                {error && (
                    <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
                        {error}
                    </span>
                )}
                {helperText && !error && (
                    <span className={styles.helperText}>{helperText}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
