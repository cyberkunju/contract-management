/**
 * DatePicker Component
 * Custom minimalistic calendar with month/year quick selection
 */

import { useState, useRef, useEffect } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

type ViewMode = 'days' | 'months' | 'years';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DatePicker({
    label,
    value,
    onChange,
    placeholder = 'Select date',
    required = false,
    disabled = false,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('days');
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            return new Date(value);
        }
        return new Date();
    });
    const [yearRangeStart, setYearRangeStart] = useState(() => {
        const year = value ? new Date(value).getFullYear() : new Date().getFullYear();
        return Math.floor(year / 12) * 12;
    });
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the value to Date object
    const selectedDate = value ? new Date(value) : null;

    // Get calendar days for current view
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, daysInPrevMonth - i),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month days to fill the grid
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const handleDayClick = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        onChange(formattedDate);
        setIsOpen(false);
        setViewMode('days');
    };

    const handleMonthClick = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setViewMode('days');
    };

    const handleYearClick = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode('months');
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handlePrevYear = () => {
        setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    };

    const handleNextYear = () => {
        setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    };

    const handlePrevYearRange = () => {
        setYearRangeStart(yearRangeStart - 12);
    };

    const handleNextYearRange = () => {
        setYearRangeStart(yearRangeStart + 12);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const isCurrentMonth = (monthIndex: number) => {
        const today = new Date();
        return viewDate.getFullYear() === today.getFullYear() && monthIndex === today.getMonth();
    };

    const isSelectedMonth = (monthIndex: number) => {
        if (!selectedDate) return false;
        return viewDate.getFullYear() === selectedDate.getFullYear() && monthIndex === selectedDate.getMonth();
    };

    const isCurrentYear = (year: number) => {
        return year === new Date().getFullYear();
    };

    const isSelectedYear = (year: number) => {
        if (!selectedDate) return false;
        return year === selectedDate.getFullYear();
    };

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setViewMode('days');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Update view date when value changes
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setViewDate(date);
            setYearRangeStart(Math.floor(date.getFullYear() / 12) * 12);
        }
    }, [value]);

    const calendarDays = generateCalendarDays();
    const yearRange = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

    return (
        <div className={styles.wrapper} ref={containerRef}>
            {label && (
                <label className={`${styles.label} ${required ? styles.required : ''}`}>
                    {label}
                </label>
            )}

            <button
                type="button"
                className={styles.trigger}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className={`${styles.triggerText} ${!value ? styles.placeholder : ''}`}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <span className={styles.triggerIcon}>Select</span>
            </button>

            {isOpen && (
                <div className={styles.calendar}>
                    {/* Header */}
                    <div className={styles.calendarHeader}>
                        {viewMode === 'days' && (
                            <>
                                <button
                                    type="button"
                                    className={styles.monthYearBtn}
                                    onClick={() => setViewMode('months')}
                                >
                                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </button>
                                <div className={styles.navButtons}>
                                    <button type="button" className={styles.navBtn} onClick={handlePrevMonth} aria-label="Previous month">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 4L6 8l4 4" />
                                        </svg>
                                    </button>
                                    <button type="button" className={styles.navBtn} onClick={handleNextMonth} aria-label="Next month">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 4l4 4-4 4" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}

                        {viewMode === 'months' && (
                            <>
                                <button
                                    type="button"
                                    className={styles.monthYearBtn}
                                    onClick={() => {
                                        setYearRangeStart(Math.floor(viewDate.getFullYear() / 12) * 12);
                                        setViewMode('years');
                                    }}
                                >
                                    {viewDate.getFullYear()}
                                </button>
                                <div className={styles.navButtons}>
                                    <button type="button" className={styles.navBtn} onClick={handlePrevYear} aria-label="Previous year">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 4L6 8l4 4" />
                                        </svg>
                                    </button>
                                    <button type="button" className={styles.navBtn} onClick={handleNextYear} aria-label="Next year">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 4l4 4-4 4" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}

                        {viewMode === 'years' && (
                            <>
                                <span className={styles.monthYear}>
                                    {yearRangeStart} — {yearRangeStart + 11}
                                </span>
                                <div className={styles.navButtons}>
                                    <button type="button" className={styles.navBtn} onClick={handlePrevYearRange} aria-label="Previous years">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 4L6 8l4 4" />
                                        </svg>
                                    </button>
                                    <button type="button" className={styles.navBtn} onClick={handleNextYearRange} aria-label="Next years">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 4l4 4-4 4" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Days View */}
                    {viewMode === 'days' && (
                        <>
                            <div className={styles.weekdays}>
                                {WEEKDAYS.map((day) => (
                                    <span key={day} className={styles.weekday}>
                                        {day}
                                    </span>
                                ))}
                            </div>

                            <div className={styles.days}>
                                {calendarDays.map((dayInfo, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`
                                            ${styles.day}
                                            ${!dayInfo.isCurrentMonth ? styles.otherMonth : ''}
                                            ${isToday(dayInfo.date) ? styles.today : ''}
                                            ${isSelected(dayInfo.date) ? styles.selected : ''}
                                        `}
                                        onClick={() => handleDayClick(dayInfo.date)}
                                    >
                                        {dayInfo.date.getDate()}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Months View */}
                    {viewMode === 'months' && (
                        <div className={styles.monthsGrid}>
                            {MONTHS_SHORT.map((month, index) => (
                                <button
                                    key={month}
                                    type="button"
                                    className={`
                                        ${styles.monthCell}
                                        ${isCurrentMonth(index) ? styles.today : ''}
                                        ${isSelectedMonth(index) ? styles.selected : ''}
                                    `}
                                    onClick={() => handleMonthClick(index)}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Years View */}
                    {viewMode === 'years' && (
                        <div className={styles.yearsGrid}>
                            {yearRange.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    className={`
                                        ${styles.yearCell}
                                        ${isCurrentYear(year) ? styles.today : ''}
                                        ${isSelectedYear(year) ? styles.selected : ''}
                                    `}
                                    onClick={() => handleYearClick(year)}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
