/**
 * Contract Lifecycle State Machine
 *
 * Implements controlled state transitions for contracts.
 * Flow: CREATED → APPROVED → SENT → SIGNED → LOCKED
 * REVOKED can occur from any pre-signature state (Trap B resolution)
 */

import type { ContractStatus, DashboardFilter } from '../types';

/**
 * Valid transitions from each state
 * This is the single source of truth for lifecycle rules
 */
export const TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
    CREATED: ['APPROVED', 'REVOKED'],
    APPROVED: ['SENT', 'CREATED', 'REVOKED'], // Can revert to draft before sending
    SENT: ['SIGNED', 'REVOKED'],
    SIGNED: ['LOCKED'],
    LOCKED: [], // Terminal state
    REVOKED: [], // Terminal state
};

/**
 * States that allow editing field values
 * Only CREATED allows editing (before any approval)
 */
export const EDITABLE_STATES: ContractStatus[] = ['CREATED'];

/**
 * Maps lifecycle states to dashboard filters (Trap A resolution)
 * - ACTIVE: Work in progress (CREATED, APPROVED)
 * - PENDING: Waiting for external action (SENT)
 * - SIGNED: Completed (SIGNED, LOCKED)
 * - ARCHIVED: Terminated (REVOKED)
 */
export const STATUS_TO_FILTER: Record<ContractStatus, Exclude<DashboardFilter, 'ALL'>> = {
    CREATED: 'ACTIVE',
    APPROVED: 'ACTIVE',
    SENT: 'PENDING',
    SIGNED: 'SIGNED',
    LOCKED: 'SIGNED',
    REVOKED: 'ARCHIVED',
};

/**
 * Action labels for transition buttons
 */
export const TRANSITION_LABELS: Record<ContractStatus, string> = {
    CREATED: 'Create',
    APPROVED: 'Approve',
    SENT: 'Send',
    SIGNED: 'Mark as Signed',
    LOCKED: 'Lock',
    REVOKED: 'Revoke',
};

/**
 * Check if a state transition is valid
 * @param from Current status
 * @param to Desired status
 * @returns Whether the transition is allowed
 */
export function canTransition(from: ContractStatus, to: ContractStatus): boolean {
    return TRANSITIONS[from].includes(to);
}

/**
 * Get all valid transitions from a given state
 * @param status Current status
 * @returns Array of valid target states
 */
export function getValidTransitions(status: ContractStatus): ContractStatus[] {
    return TRANSITIONS[status];
}

/**
 * Check if a contract can be edited in its current state
 * @param status Current status
 * @returns Whether field values can be modified
 */
export function isEditable(status: ContractStatus): boolean {
    return EDITABLE_STATES.includes(status);
}

/**
 * Check if a status is terminal (no further transitions possible)
 * @param status Current status
 * @returns Whether the status is terminal
 */
export function isTerminal(status: ContractStatus): boolean {
    return TRANSITIONS[status].length === 0;
}

/**
 * Get the dashboard filter category for a status
 * @param status Contract status
 * @returns Dashboard filter category
 */
export function getFilterForStatus(status: ContractStatus): Exclude<DashboardFilter, 'ALL'> {
    return STATUS_TO_FILTER[status];
}

/**
 * Get all statuses that belong to a filter category
 * @param filter Dashboard filter
 * @returns Array of statuses in that category
 */
export function getStatusesForFilter(filter: DashboardFilter): ContractStatus[] {
    if (filter === 'ALL') {
        return Object.keys(TRANSITIONS) as ContractStatus[];
    }
    return (Object.entries(STATUS_TO_FILTER) as [ContractStatus, DashboardFilter][])
        .filter(([, f]) => f === filter)
        .map(([status]) => status);
}
