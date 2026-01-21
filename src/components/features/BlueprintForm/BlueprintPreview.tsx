/**
 * BlueprintPreview Component
 * Displays a simulated contract view for a blueprint
 */

import { Button } from '../../ui';
import type { BlueprintField } from '../../../types';
import styles from './BlueprintPreview.module.css';

interface BlueprintPreviewProps {
    name: string;
    fields: BlueprintField[];
    onClose: () => void;
}

const PREVIEW_DATA = {
    name: 'Navaneeth K',
    email: 'navaneeth@example.com',
    address: 'Bangalore, Chokkanahlli 560064',
    date: new Date().toISOString().split('T')[0],
    company: 'EuroSys Corp',
};

export function BlueprintPreview({ name, fields, onClose }: BlueprintPreviewProps) {
    return (
        <div className={styles.previewOverlay}>
            <div className={styles.previewContainer}>
                {/* Header */}
                <div className={styles.previewTopBar}>
                    <div>
                        <h1 className={styles.previewTitle}>{name || 'Untitled Contract'}</h1>
                        <div className={styles.previewMeta}>
                            Employment Contract • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={onClose}>
                        Exit Preview
                    </Button>
                </div>

                {/* Timeline */}
                <div className={styles.previewTimeline}>
                    <div className={styles.timelineStep}>
                        <div className={`${styles.timelineCircle} ${styles.timelineCircleActive}`}>
                            <svg className={styles.timelineIcon} viewBox="0 0 16 16">
                                <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <span className={styles.timelineLabel} style={{ color: 'var(--color-ink)' }}>Created</span>
                    </div>
                    <div className={styles.timelineStep}>
                        <div className={`${styles.timelineCircle} ${styles.timelineCircleActive}`}>
                            <svg className={styles.timelineIcon} viewBox="0 0 16 16">
                                <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <span className={styles.timelineLabel} style={{ color: 'var(--color-ink)' }}>Approved</span>
                    </div>
                    <div className={styles.timelineStep}>
                        <div className={`${styles.timelineCircle} ${styles.timelineCircleActive}`} style={{ boxShadow: '0 0 0 4px var(--color-primary-light)' }}>
                            3
                        </div>
                        <span className={styles.timelineLabel} style={{ color: 'var(--color-primary)' }}>Sent</span>
                    </div>
                    <div className={styles.timelineStep}>
                        <div className={styles.timelineCircle}>4</div>
                        <span className={styles.timelineLabel}>Signed</span>
                    </div>
                    <div className={styles.timelineStep}>
                        <div className={styles.timelineCircle}>5</div>
                        <span className={styles.timelineLabel}>Locked</span>
                    </div>
                </div>

                {/* Banner */}
                <div className={styles.previewBanner}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
                        <circle cx="8" cy="8" r="7" stroke="none" />
                        <path d="M8 4v5M8 11v.01" stroke="white" strokeWidth="2" />
                    </svg>
                    Please review the contract details and click "Sign Contract" to add your signature.
                </div>

                <div style={{ marginBottom: 'var(--space-6)', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Contract Fields
                </div>
                <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: 'var(--space-6)' }} />

                {/* Field Grid */}
                <div className={styles.previewGrid}>
                    {fields.map((field) => {
                        const isFullWidth =
                            field.type === 'SIGNATURE' ||
                            field.type === 'CHECKBOX' ||
                            (field.type === 'TEXT' && field.label.length > 30);
                        return (
                            <div key={field.id} className={isFullWidth ? styles.previewFieldFullWidth : undefined}>
                                <label className={styles.previewLabel}>
                                    {field.label} {field.required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                                </label>

                                {field.type === 'CHECKBOX' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" disabled checked={field.required} />
                                        <span style={{ fontSize: '14px' }}>{field.label}</span>
                                    </div>
                                ) : field.type === 'SIGNATURE' ? (
                                    <div className={styles.previewSignatureBox}>
                                        <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Click "Sign Contract" to sign</span>
                                    </div>
                                ) : (
                                    <div className={styles.previewValue}>
                                        {field.type === 'TEXT'
                                            ? field.label.toLowerCase().includes('name')
                                                ? PREVIEW_DATA.name
                                                : field.label.toLowerCase().includes('address')
                                                    ? PREVIEW_DATA.address
                                                    : field.label.toLowerCase().includes('job')
                                                        ? 'Senior Engineer'
                                                        : field.label.toLowerCase().includes('salary')
                                                            ? '$120,000'
                                                            : '—'
                                            : field.type === 'DATE'
                                                ? 'Jan 1, 1970'
                                                : '—'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className={styles.previewActions}>
                    <Button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        Sign Contract
                    </Button>
                    <div style={{ flex: 1 }} />
                    <Button type="button" variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}
