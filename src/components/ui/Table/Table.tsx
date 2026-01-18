/**
 * Table Component
 * Reusable table with sorting support and empty state
 */

import type { ReactNode } from 'react';
import styles from './Table.module.css';

export interface Column<T> {
    /** Unique key for the column */
    key: string;
    /** Header label */
    header: string;
    /** Cell renderer */
    render: (item: T) => ReactNode;
    /** Column width (CSS value) */
    width?: string;
    /** Sortable */
    sortable?: boolean;
}

export interface TableProps<T> {
    /** Data array */
    data: T[];
    /** Column definitions */
    columns: Column<T>[];
    /** Unique key function */
    getRowKey: (item: T) => string;
    /** Row click handler */
    onRowClick?: (item: T) => void;
    /** Empty state content */
    emptyState?: ReactNode;
    /** Loading state */
    loading?: boolean;
}

export function Table<T>({
    data,
    columns,
    getRowKey,
    onRowClick,
    emptyState,
}: TableProps<T>) {
    if (data.length === 0 && emptyState) {
        return <div className={styles.tableWrapper}>{emptyState}</div>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} style={{ width: col.width }}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={getRowKey(item)}
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? styles.clickable : ''}
                        >
                            {columns.map((col) => (
                                <td key={col.key}>{col.render(item)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Empty state component for tables */
export interface TableEmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function TableEmptyState({ icon, title, description, action }: TableEmptyStateProps) {
    return (
        <div className={styles.emptyState}>
            {icon && <div className={styles.emptyIcon}>{icon}</div>}
            <div className={styles.emptyTitle}>{title}</div>
            {description && <div className={styles.emptyDescription}>{description}</div>}
            {action}
        </div>
    );
}
