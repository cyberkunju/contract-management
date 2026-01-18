/**
 * Badge Component
 * Status and label badges with color variants
 */

import type { ReactNode } from 'react';
import type { ContractStatus } from '../../../types';
import styles from './Badge.module.css';

export type BadgeVariant =
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | ContractStatus;

export interface BadgeProps {
    /** Visual variant */
    variant?: BadgeVariant;
    /** Badge content */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/** Map contract status to CSS class */
const statusClassMap: Record<ContractStatus, string> = {
    CREATED: styles.created,
    APPROVED: styles.approved,
    SENT: styles.sent,
    SIGNED: styles.signed,
    LOCKED: styles.locked,
    REVOKED: styles.revoked,
};

const variantClassMap: Record<string, string> = {
    default: styles.default,
    success: styles.success,
    warning: styles.warning,
    error: styles.error,
    info: styles.info,
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
    const variantClass = statusClassMap[variant as ContractStatus] || variantClassMap[variant] || styles.default;

    return (
        <span className={`${styles.badge} ${variantClass} ${className}`}>
            {children}
        </span>
    );
}
