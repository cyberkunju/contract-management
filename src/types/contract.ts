/**
 * Contract Types and Lifecycle
 * Defines the structure for contracts created from blueprints
 */

import type { FieldType } from './blueprint';

/**
 * Contract lifecycle states
 * Flow: CREATED → APPROVED → SENT → SIGNED → LOCKED
 * REVOKED can occur from CREATED, APPROVED, or SENT
 */
export type ContractStatus =
    | 'CREATED'
    | 'APPROVED'
    | 'SENT'
    | 'SIGNED'
    | 'LOCKED'
    | 'REVOKED';

/** Dashboard filter categories (Trap A resolution) */
export type DashboardFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'SIGNED' | 'ARCHIVED';

/** Status labels for UI display */
export const STATUS_LABELS: Record<ContractStatus, string> = {
    CREATED: 'Created',
    APPROVED: 'Approved',
    SENT: 'Sent',
    SIGNED: 'Signed',
    LOCKED: 'Locked',
    REVOKED: 'Revoked',
};

/** Dashboard filter labels for UI display */
export const FILTER_LABELS: Record<DashboardFilter, string> = {
    ALL: 'All Contracts',
    ACTIVE: 'Active',
    PENDING: 'Pending',
    SIGNED: 'Signed',
    ARCHIVED: 'Archived',
};

/** A field within a contract, copied from blueprint with value */
export interface ContractField {
    /** Unique identifier (copied from blueprint field) */
    id: string;
    /** Type of input for this field */
    type: FieldType;
    /** Human-readable label */
    label: string;
    /** Order position */
    position: number;
    /** Whether this field is required */
    required: boolean;
    /** Placeholder text for TEXT fields */
    placeholder?: string;
    /**
     * User-provided value
     * - TEXT: string
     * - DATE: ISO date string
     * - SIGNATURE: base64 image data or null
     * - CHECKBOX: boolean
     */
    value: string | boolean | null;
}

/** A contract instance created from a blueprint */
export interface Contract {
    /** Unique identifier */
    id: string;
    /** Contract name */
    name: string;
    /** Source blueprint ID (for reference) */
    blueprintId: string;
    /** Source blueprint name (denormalized for display) */
    blueprintName: string;
    /** Current lifecycle status */
    status: ContractStatus;
    /** Fields copied from blueprint with values */
    fields: ContractField[];
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last modification */
    updatedAt: string;
}

/** Data required to create a new contract */
export interface ContractCreateInput {
    name: string;
    blueprintId: string;
}
