/**
 * Button Component
 * Reusable button with variants, sizes, and loading state
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    /** Size of the button */
    size?: 'sm' | 'md' | 'lg';
    /** Show loading spinner */
    loading?: boolean;
    /** Icon-only button (square aspect ratio) */
    iconOnly?: boolean;
    /** Custom instant tooltip (appears immediately on hover) */
    tooltip?: string;
    /** Button content */
    children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            iconOnly = false,
            tooltip,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const classes = [
            styles.button,
            styles[variant],
            styles[size],
            iconOnly && styles.iconOnly,
            loading && styles.loading,
            tooltip && styles.hasTooltip,
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <span className={styles.spinner} />}
                {children}
                {tooltip && <span className={styles.tooltip}>{tooltip}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
