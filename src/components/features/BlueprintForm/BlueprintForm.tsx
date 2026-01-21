/**
 * BlueprintForm Component
 * Form for creating and editing blueprints with optimized custom Drag-and-Drop
 */

import { useState, useEffect, useRef } from 'react';
import type { Blueprint, BlueprintField, FieldType } from '../../../types';
import { FIELD_TYPE_LABELS } from '../../../types';
import { Button, Input, Card, CardBody, Modal } from '../../ui';
import { generateId } from '../../../utils';
import styles from './BlueprintForm.module.css';
import { BlueprintPreview } from './BlueprintPreview';

interface BlueprintFormProps {
    initialData?: Blueprint;
    onSubmit: (data: { name: string; description: string; fields: BlueprintField[] }) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
    TEXT: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 4h10M3 8h7M3 12h9" />
        </svg>
    ),
    DATE: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="12" height="11" rx="1" />
            <path d="M5 1v3M11 1v3M2 7h12" />
        </svg>
    ),
    SIGNATURE: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12c2-4 4-6 6-2s4 2 6-2" />
        </svg>
    ),
    CHECKBOX: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <path d="M5 8l2 2 4-4" />
        </svg>
    ),
};

// Drag Item Types
type DragType = 'EXISTING_FIELD' | 'NEW_TOOL';

interface DragState {
    type: DragType;
    id?: string;        // ID if existing field
    toolType?: FieldType; // Type if new tool
    index?: number;     // Index if existing
}

export function BlueprintForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: BlueprintFormProps) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [fields, setFields] = useState<BlueprintField[]>(initialData?.fields ?? []);
    const [editingField, setEditingField] = useState<BlueprintField | null>(null);
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [showPreview, setShowPreview] = useState(false);


    // Standard Form State
    const [fieldLabel, setFieldLabel] = useState('');
    const [fieldRequired, setFieldRequired] = useState(false);
    const [fieldPlaceholder, setFieldPlaceholder] = useState('');
    const [fieldForClient, setFieldForClient] = useState(false);

    // Drag and Drop State
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);

    // Persist drag reference for smoother updates
    const dragItem = useRef<DragState | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingField) {
            setFieldLabel(editingField.label);
            setFieldRequired(editingField.required);
            setFieldPlaceholder(editingField.placeholder ?? '');
            setFieldForClient(editingField.editableBy === 'client');
        }
    }, [editingField]);

    // Close preview on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowPreview(false);
        };
        if (showPreview) window.addEventListener('keydown', handleEsc);



        return () => window.removeEventListener('keydown', handleEsc);
    }, [showPreview]);

    // --- Actions ---

    const createNewField = (type: FieldType): BlueprintField => ({
        id: generateId(),
        type,
        label: `New ${FIELD_TYPE_LABELS[type]}`,
        position: 0, // Assigned later
        required: false,
        editableBy: type === 'SIGNATURE' ? 'client' : 'manager',
        placeholder: '',
    });

    const handleAddField = (type: FieldType, index?: number) => {
        const newField = createNewField(type);
        const insertIndex = index !== undefined ? index : fields.length;

        const newFields = [...fields];
        newFields.splice(insertIndex, 0, newField);

        // Re-index
        const reindexed = newFields.map((f, i) => ({ ...f, position: i }));
        setFields(reindexed);
        setEditingField(newField);
    };

    const handleUpdateField = () => {
        if (!editingField) return;
        setFields(
            fields.map((f) =>
                f.id === editingField.id
                    ? {
                        ...f,
                        label: fieldLabel,
                        required: fieldRequired,
                        placeholder: fieldPlaceholder || undefined,
                        editableBy:
                            editingField.type === 'SIGNATURE'
                                ? 'client'
                                : editingField.type === 'DATE'
                                    ? 'manager'
                                    : fieldForClient
                                        ? 'client'
                                        : 'manager',
                    }
                    : f
            )
        );
        setEditingField(null);
    };

    const handleDeleteField = (fieldId: string) => {
        setFields(fields.filter((f) => f.id !== fieldId).map((f, index) => ({ ...f, position: index })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { name?: string } = {};
        if (!name.trim()) newErrors.name = 'Blueprint name is required';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        onSubmit({ name: name.trim(), description: description.trim(), fields });
    };

    // --- Container-Aware Drag and Drop Handlers ---

    const handleDragStart = (e: React.DragEvent, type: DragType, data: { id?: string; index?: number; toolType?: FieldType }) => {
        const state: DragState = { type, ...data };
        setDragState(state);
        dragItem.current = state;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleContainerDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!listRef.current) return;

        const offsetY = e.clientY;
        const children = Array.from(listRef.current.querySelectorAll('[data-field-item="true"]'));

        let closestIndex = children.length;
        let minDistance = Infinity;

        children.forEach((child, index) => {
            const rect = child.getBoundingClientRect();
            const centerY = rect.top + (rect.height / 2);

            if (offsetY >= rect.top && offsetY <= rect.bottom) {
                if (offsetY < centerY) {
                    closestIndex = index;
                } else {
                    closestIndex = index + 1;
                }
                minDistance = 0;
                return;
            }

            const distToTop = Math.abs(offsetY - rect.top);
            if (distToTop < minDistance) {
                minDistance = distToTop;
                closestIndex = index;
            }
        });

        if (children.length > 0) {
            const lastRect = children[children.length - 1].getBoundingClientRect();
            if (offsetY > lastRect.bottom) {
                closestIndex = children.length;
            }
        } else {
            closestIndex = 0;
        }

        setDropIndex(closestIndex);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const state = dragItem.current;
        const targetIndex = dropIndex;

        if (!state || targetIndex === null) return;

        if (state.type === 'NEW_TOOL' && state.toolType) {
            handleAddField(state.toolType, targetIndex);
        } else if (state.type === 'EXISTING_FIELD' && state.index !== undefined) {
            const oldIndex = state.index;
            let newIndex = targetIndex;

            if (oldIndex === newIndex || newIndex === oldIndex + 1) {
                resetDrag();
                return;
            }

            let checkedIndex = newIndex;
            if (oldIndex < newIndex) {
                checkedIndex -= 1;
            }

            const newFields = [...fields];
            const [movedItem] = newFields.splice(oldIndex, 1);
            newFields.splice(checkedIndex, 0, movedItem);

            setFields(newFields.map((f, i) => ({ ...f, position: i })));
        }
        resetDrag();
    };

    const resetDrag = () => {
        setDragState(null);
        setDropIndex(null);
        dragItem.current = null;
    };



    return (
        <form className={styles.form} onSubmit={handleSubmit} onDragOver={(e) => e.preventDefault()}>
            <Card>
                <CardBody className={styles.section}>
                    <h2 className={styles.sectionTitle}>Basic Information</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Input
                            label="Blueprint Name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Employment Contract"
                            error={errors.name}
                            required
                        />
                        <Input
                            as="textarea"
                            label="Description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the purpose of this template..."
                        />
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody className={styles.section}>
                    <h2 className={styles.sectionTitle}>Fields</h2>

                    {fields.length === 0 ? (
                        <div
                            className={styles.emptyFields}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropIndex(0); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const state = dragItem.current;
                                if (state?.type === 'NEW_TOOL' && state.toolType) handleAddField(state.toolType, 0);
                                resetDrag();
                            }}
                            style={{
                                border: dropIndex === 0 ? '2px dashed var(--color-primary)' : 'none',
                                background: dropIndex === 0 ? 'var(--color-primary-light)' : 'transparent'
                            }}
                        >
                            <svg className={styles.emptyFieldsIcon} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="4" width="32" height="32" rx="4" />
                                <path d="M12 14h16M12 20h10M12 26h12" />
                            </svg>
                            <p>Drag tools here or add fields below to start.</p>
                        </div>
                    ) : (
                        <div
                            className={styles.fieldList}
                            ref={listRef}
                            onDragOver={handleContainerDragOver}
                            onDrop={handleDrop}
                            onDragLeave={(e) => {
                                if (e.relatedTarget && !listRef.current?.contains(e.relatedTarget as Node)) {
                                    setDropIndex(null);
                                }
                            }}
                        >
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className={styles.fieldItemWrapper}
                                    data-field-item="true"
                                >
                                    {dropIndex === index && dragState && (
                                        <div className={styles.dropPlaceholder} />
                                    )}

                                    <div
                                        className={`${styles.fieldItem} ${dragState?.id === field.id ? styles.isDragging : ''}`}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, 'EXISTING_FIELD', { id: field.id, index })}
                                        style={{ pointerEvents: dragState ? 'none' : 'auto' }}
                                    >
                                        <div
                                            className={styles.moveButton}
                                            style={{ cursor: 'grab', pointerEvents: 'auto' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M5 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                                            </svg>
                                        </div>
                                        <div className={styles.fieldIcon}>{FIELD_ICONS[field.type]}</div>
                                        <div className={styles.fieldInfo}>
                                            <div className={styles.fieldLabel}>
                                                {field.label}
                                                {field.required && <span className={styles.requiredBadge}>*</span>}
                                            </div>
                                            <div className={styles.fieldType}>
                                                {FIELD_TYPE_LABELS[field.type]}
                                                {field.editableBy === 'client' && (
                                                    <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-primary)' }}>
                                                        Client Only
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.fieldActions} style={{ pointerEvents: 'auto' }}>
                                            <Button type="button" variant="ghost" size="sm" iconOnly onClick={() => setEditingField(field)} tooltip="Edit">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2a1.5 1.5 0 012.1 2.1L4.5 12l-3 .75.75-3L10 2z" /></svg>
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" iconOnly onClick={() => handleDeleteField(field.id)} tooltip="Delete">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 3l-8 8M3 3l8 8" /></svg>
                                            </Button>
                                        </div>
                                    </div>

                                    {dropIndex === fields.length && index === fields.length - 1 && dragState && (
                                        <div className={styles.dropPlaceholder} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.addFieldSection}>
                        {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                            <div
                                key={type}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, 'NEW_TOOL', { toolType: type })}
                                onDragEnd={resetDrag}
                                className={styles.addFieldButton}
                                style={{ cursor: 'grab' }}
                                onClick={() => handleAddField(type)}
                            >
                                <div style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {FIELD_ICONS[type]}
                                    Add {FIELD_TYPE_LABELS[type]}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <div style={{ flex: 1 }} />
                <Button type="button" variant="secondary" onClick={() => setShowPreview(true)} disabled={fields.length === 0} tooltip="Preview with dummy data">
                    Preview
                </Button>
                <Button type="submit" loading={isSubmitting}>
                    {initialData ? 'Save Changes' : 'Create Blueprint'}
                </Button>
            </div>

            {/* Edit Field Modal */}
            <Modal isOpen={!!editingField} onClose={() => setEditingField(null)} title="Edit Field" footer={<><Button type="button" variant="secondary" onClick={() => setEditingField(null)}>Cancel</Button><Button type="button" onClick={handleUpdateField}>Save Field</Button></>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Input label="Field Label" value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="Enter field label" />
                    {editingField?.type === 'TEXT' && <Input label="Placeholder Text" value={fieldPlaceholder} onChange={(e) => setFieldPlaceholder(e.target.value)} placeholder="Enter placeholder text" />}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={fieldRequired} onChange={(e) => setFieldRequired(e.target.checked)} />
                        <span style={{ fontSize: 'var(--text-sm)' }}>Required field</span>
                    </label>
                    {(editingField?.type === 'TEXT' || editingField?.type === 'CHECKBOX') && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={fieldForClient} onChange={(e) => setFieldForClient(e.target.checked)} />
                            <span style={{ fontSize: 'var(--text-sm)' }}>Client Field (Editable by Client only)</span>
                        </label>
                    )}
                </div>
            </Modal>

            {/* Full Page Client Preview (Exact Replica) */}
            {showPreview && (
                <BlueprintPreview
                    name={name}
                    fields={fields}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </form>
    );
}
