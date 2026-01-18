/**
 * Card Component
 * Container for content with optional header and footer
 */

import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Card content */
    children: ReactNode;
    /** Interactive hover effect */
    interactive?: boolean;
    /** Compact padding */
    compact?: boolean;
}

export interface CardHeaderProps {
    /** Title text */
    title: string;
    /** Optional description */
    description?: string;
    /** Actions (buttons, etc.) */
    actions?: ReactNode;
}

export interface CardSectionProps {
    children: ReactNode;
    className?: string;
}

export function Card({
    children,
    interactive = false,
    compact = false,
    className = '',
    ...props
}: CardProps) {
    const classes = [
        styles.card,
        interactive && styles.interactive,
        compact && styles.compact,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ title, description, actions }: CardHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.headerTitle}>
                <h3 className={styles.title}>{title}</h3>
                {actions}
            </div>
            {description && <p className={styles.description}>{description}</p>}
        </div>
    );
}

export function CardBody({ children, className = '' }: CardSectionProps) {
    return <div className={`${styles.body} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
    return <div className={`${styles.footer} ${className}`}>{children}</div>;
}
