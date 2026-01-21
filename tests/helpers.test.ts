/**
 * Helper Functions Tests
 * Tests for date formatting, truncation, and other utilities
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
    formatDate,
    formatDateForInput,
    getRelativeTime,
    truncate,
    debounce,
} from '../src/utils/helpers';

describe('Helper Functions', () => {
    describe('formatDate', () => {
        it('should format valid ISO dates correctly', () => {
            expect(formatDate('2026-01-17T12:00:00Z')).toBe('Jan 17, 2026');
        });
    });

    describe('formatDateForInput', () => {
        it('should format dates as YYYY-MM-DD', () => {
            expect(formatDateForInput('2026-01-17T12:00:00Z')).toBe('2026-01-17');
        });

        it('should return empty string for null input', () => {
            expect(formatDateForInput(null)).toBe('');
        });
    });

    describe('getRelativeTime', () => {
        beforeEach(() => {
            // Mock current date to "2026-01-20" for consistent relative time tests
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-01-20T12:00:00Z'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return "Today" for same day', () => {
            // Same day, slightly earlier
            expect(getRelativeTime('2026-01-20T10:00:00Z')).toBe('Today');
        });

        it('should return "Yesterday" for 1 day ago', () => {
            expect(getRelativeTime('2026-01-19T12:00:00Z')).toBe('Yesterday');
        });

        it('should return "2 days ago" for 2 days ago', () => {
            expect(getRelativeTime('2026-01-18T12:00:00Z')).toBe('2 days ago');
        });

        it('should return weeks ago', () => {
            expect(getRelativeTime('2026-01-06T12:00:00Z')).toBe('2 weeks ago');
        });

        it('should return months ago', () => {
            expect(getRelativeTime('2025-11-20T12:00:00Z')).toBe('2 months ago');
        });

        it('should return years ago', () => {
            expect(getRelativeTime('2024-01-20T12:00:00Z')).toBe('2 years ago');
        });
    });

    describe('truncate', () => {
        it('should not truncate text shorter than maxLength', () => {
            expect(truncate('Hello', 10)).toBe('Hello');
            expect(truncate('Hello', 5)).toBe('Hello');
        });

        it('should truncate text longer than maxLength and add ellipsis', () => {
            expect(truncate('Hello World', 8)).toBe('Hello...'); // 5 chars + 3 dots = 8
        });
    });

    describe('debounce', () => {
        it('should debounce function calls', async () => {
            vi.useFakeTimers();
            const func = vi.fn();
            const debouncedFunc = debounce(func, 100);

            // Call multiple times rapidly
            debouncedFunc();
            debouncedFunc();
            debouncedFunc();

            // Function should not have been called yet
            expect(func).not.toHaveBeenCalled();

            // Fast forward time
            vi.advanceTimersByTime(100);

            // Function should have been called once
            expect(func).toHaveBeenCalledTimes(1);
        });
    });
});
