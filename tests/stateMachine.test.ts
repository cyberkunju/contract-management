/**
 * Contract Lifecycle State Machine Tests
 * Tests the FSM logic that controls contract state transitions
 */

import { describe, it, expect } from 'vitest';
import {
    canTransition,
    getValidTransitions,
    isEditable,
    isTerminal,
    getFilterForStatus,
    getStatusesForFilter,
    TRANSITIONS,
} from '../src/utils/stateMachine';

describe('Contract Lifecycle State Machine', () => {
    describe('canTransition', () => {
        it('should allow valid forward transitions', () => {
            expect(canTransition('CREATED', 'APPROVED')).toBe(true);
            expect(canTransition('APPROVED', 'SENT')).toBe(true);
            expect(canTransition('SENT', 'SIGNED')).toBe(true);
            expect(canTransition('SIGNED', 'LOCKED')).toBe(true);
        });

        it('should prevent skipping states', () => {
            expect(canTransition('CREATED', 'SENT')).toBe(false);
            expect(canTransition('CREATED', 'SIGNED')).toBe(false);
            expect(canTransition('CREATED', 'LOCKED')).toBe(false);
            expect(canTransition('APPROVED', 'SIGNED')).toBe(false);
        });

        it('should allow REVOKED from CREATED, APPROVED, and SENT (Trap B resolution)', () => {
            expect(canTransition('CREATED', 'REVOKED')).toBe(true);
            expect(canTransition('APPROVED', 'REVOKED')).toBe(true);
            expect(canTransition('SENT', 'REVOKED')).toBe(true);
        });

        it('should NOT allow REVOKED from SIGNED or LOCKED', () => {
            expect(canTransition('SIGNED', 'REVOKED')).toBe(false);
            expect(canTransition('LOCKED', 'REVOKED')).toBe(false);
        });

        it('should prevent transitions from terminal states', () => {
            expect(canTransition('LOCKED', 'CREATED')).toBe(false);
            expect(canTransition('LOCKED', 'APPROVED')).toBe(false);
            expect(canTransition('REVOKED', 'CREATED')).toBe(false);
            expect(canTransition('REVOKED', 'APPROVED')).toBe(false);
        });

        it('should prevent backward transitions (except Revert to Draft)', () => {
            // APPROVED -> CREATED is now allowed (Revert to Draft feature)
            expect(canTransition('APPROVED', 'CREATED')).toBe(true);
            // But other backward transitions are still blocked
            expect(canTransition('SENT', 'APPROVED')).toBe(false);
            expect(canTransition('SIGNED', 'SENT')).toBe(false);
        });
    });

    describe('getValidTransitions', () => {
        it('should return correct transitions for each state', () => {
            expect(getValidTransitions('CREATED')).toEqual(['APPROVED', 'REVOKED']);
            expect(getValidTransitions('APPROVED')).toEqual(['SENT', 'CREATED', 'REVOKED']);
            expect(getValidTransitions('SENT')).toEqual(['SIGNED', 'REVOKED']);
            expect(getValidTransitions('SIGNED')).toEqual(['LOCKED']);
            expect(getValidTransitions('LOCKED')).toEqual([]);
            expect(getValidTransitions('REVOKED')).toEqual([]);
        });
    });

    describe('isEditable', () => {
        it('should only allow editing in CREATED state', () => {
            expect(isEditable('CREATED')).toBe(true);
            expect(isEditable('APPROVED')).toBe(false);
            expect(isEditable('SENT')).toBe(false);
            expect(isEditable('SIGNED')).toBe(false);
            expect(isEditable('LOCKED')).toBe(false);
            expect(isEditable('REVOKED')).toBe(false);
        });
    });

    describe('isTerminal', () => {
        it('should identify LOCKED and REVOKED as terminal states', () => {
            expect(isTerminal('LOCKED')).toBe(true);
            expect(isTerminal('REVOKED')).toBe(true);
        });

        it('should identify non-terminal states', () => {
            expect(isTerminal('CREATED')).toBe(false);
            expect(isTerminal('APPROVED')).toBe(false);
            expect(isTerminal('SENT')).toBe(false);
            expect(isTerminal('SIGNED')).toBe(false);
        });
    });

    describe('Dashboard Filter Mapping (Trap A resolution)', () => {
        it('should map statuses to correct filters', () => {
            expect(getFilterForStatus('CREATED')).toBe('ACTIVE');
            expect(getFilterForStatus('APPROVED')).toBe('ACTIVE');
            expect(getFilterForStatus('SENT')).toBe('PENDING');
            expect(getFilterForStatus('SIGNED')).toBe('SIGNED');
            expect(getFilterForStatus('LOCKED')).toBe('SIGNED');
            expect(getFilterForStatus('REVOKED')).toBe('ARCHIVED');
        });

        it('should return correct statuses for each filter', () => {
            expect(getStatusesForFilter('ACTIVE')).toEqual(['CREATED', 'APPROVED']);
            expect(getStatusesForFilter('PENDING')).toEqual(['SENT']);
            expect(getStatusesForFilter('SIGNED')).toEqual(['SIGNED', 'LOCKED']);
            expect(getStatusesForFilter('ARCHIVED')).toEqual(['REVOKED']);
        });

        it('should return all statuses for ALL filter', () => {
            const allStatuses = getStatusesForFilter('ALL');
            expect(allStatuses).toContain('CREATED');
            expect(allStatuses).toContain('APPROVED');
            expect(allStatuses).toContain('SENT');
            expect(allStatuses).toContain('SIGNED');
            expect(allStatuses).toContain('LOCKED');
            expect(allStatuses).toContain('REVOKED');
        });
    });

    describe('Transition matrix integrity', () => {
        it('should have all 6 states defined', () => {
            const states = Object.keys(TRANSITIONS);
            expect(states).toHaveLength(6);
            expect(states).toContain('CREATED');
            expect(states).toContain('APPROVED');
            expect(states).toContain('SENT');
            expect(states).toContain('SIGNED');
            expect(states).toContain('LOCKED');
            expect(states).toContain('REVOKED');
        });
    });
});
