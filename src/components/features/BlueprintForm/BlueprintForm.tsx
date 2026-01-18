/**
 * BlueprintForm Component
 * Form for creating and editing blueprints with field management
 */

import { useState, useEffect } from 'react';
import type { Blueprint, BlueprintField, FieldType } from '../../../types';
import { FIELD_TYPE_LABELS } from '../../../types';
import { Button, Input, Card, CardBody, Modal } from '../../ui';
import { generateId } from '../../../utils';
import styles from './BlueprintForm.module.css';

interface BlueprintFormProps {
    /** Initial blueprint data for editing */
    initialData?: Blueprint;
    /** Submit handler */
    onSubmit: (data: { name: string; description: string; fields: BlueprintField[] }) => void;
    /** Cancel handler */
    onCancel: () => void;
    /** Whether the form is submitting */
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

    // Field form state
    const [fieldLabel, setFieldLabel] = useState('');
    const [fieldRequired, setFieldRequired] = useState(false);
    const [fieldPlaceholder, setFieldPlaceholder] = useState('');
    const [fieldForClient, setFieldForClient] = useState(false);

    useEffect(() => {
        if (editingField) {
            setFieldLabel(editingField.label);
            setFieldRequired(editingField.required);
            setFieldPlaceholder(editingField.placeholder ?? '');
            setFieldForClient(editingField.editableBy === 'client');
        }
    }, [editingField]);

    const handleAddField = (type: FieldType) => {
        const newField: BlueprintField = {
            id: generateId(),
            type,
            label: `New ${FIELD_TYPE_LABELS[type]}`,
            position: fields.length,
            required: false,
            editableBy: type === 'SIGNATURE' ? 'client' : 'manager',
        };
        setFields([...fields, newField]);
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
                        editableBy: editingField.type === 'SIGNATURE' ? 'client' : (editingField.type === 'DATE' ? 'manager' : (fieldForClient ? 'client' : 'manager')),
                    }
                    : f
            )
        );
        setEditingField(null);
        setFieldLabel('');
        setFieldRequired(false);
        setFieldPlaceholder('');
        setFieldForClient(false);
    };

    const handleDeleteField = (fieldId: string) => {
        setFields(
            fields
                .filter((f) => f.id !== fieldId)
                .map((f, index) => ({ ...f, position: index }))
        );
    };

    const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
        const index = fields.findIndex((f) => f.id === fieldId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fields.length) return;

        const newFields = [...fields];
        [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
        setFields(newFields.map((f, i) => ({ ...f, position: i })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: { name?: string } = {};
        if (!name.trim()) {
            newErrors.name = 'Blueprint name is required';
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        onSubmit({ name: name.trim(), description: description.trim(), fields });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
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
                        <div className={styles.emptyFields}>
                            <svg className={styles.emptyFieldsIcon} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="4" width="32" height="32" rx="4" />
                                <path d="M12 14h16M12 20h10M12 26h12" />
                            </svg>
                            <p>No fields added yet. Add fields below to build your template.</p>
                        </div>
                    ) : (
                        <div className={styles.fieldList}>
                            {fields
                                .sort((a, b) => a.position - b.position)
                                .map((field, index) => (
                                    <div key={field.id} className={styles.fieldItem}>
                                        <div className={styles.fieldIcon}>{FIELD_ICONS[field.type]}</div>
                                        <div className={styles.fieldInfo}>
                                            <div className={styles.fieldLabel}>
                                                {field.label}
                                                {field.required && <span className={styles.requiredBadge}>*</span>}
                                            </div>
                                            <div className={styles.fieldType}>
                                                {FIELD_TYPE_LABELS[field.type]}
                                                {field.editableBy === 'client' && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-primary)' }}>Client Only</span>}
                                            </div>
                                        </div>
                                        <div className={styles.fieldActions}>
                                            <button
                                                type="button"
                                                className={styles.moveButton}
                                                onClick={() => handleMoveField(field.id, 'up')}
                                                disabled={index === 0}
                                                aria-label="Move up"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M7 11V3M3 7l4-4 4 4" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.moveButton}
                                                onClick={() => handleMoveField(field.id, 'down')}
                                                disabled={index === fields.length - 1}
                                                aria-label="Move down"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M7 3v8M3 7l4 4 4-4" />
                                                </svg>
                                            </button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                iconOnly
                                                onClick={() => setEditingField(field)}
                                                aria-label="Edit field"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M10 2a1.5 1.5 0 012.1 2.1L4.5 12l-3 .75.75-3L10 2z" />
                                                </svg>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                iconOnly
                                                onClick={() => handleDeleteField(field.id)}
                                                aria-label="Delete field"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 3l-8 8M3 3l8 8" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    <div className={styles.addFieldSection}>
                        {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={styles.addFieldButton}
                                onClick={() => handleAddField(type)}
                            >
                                {FIELD_ICONS[type]}
                                Add {FIELD_TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                    {initialData ? 'Save Changes' : 'Create Blueprint'}
                </Button>
            </div>

            {/* Edit Field Modal */}
            <Modal
                isOpen={!!editingField}
                onClose={() => setEditingField(null)}
                title="Edit Field"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditingField(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateField}>Save Field</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Input
                        label="Field Label"
                        value={fieldLabel}
                        onChange={(e) => setFieldLabel(e.target.value)}
                        placeholder="Enter field label"
                    />
                    {editingField?.type === 'TEXT' && (
                        <Input
                            label="Placeholder Text"
                            value={fieldPlaceholder}
                            onChange={(e) => setFieldPlaceholder(e.target.value)}
                            placeholder="Enter placeholder text"
                        />
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={fieldRequired}
                            onChange={(e) => setFieldRequired(e.target.checked)}
                        />
                        <span style={{ fontSize: 'var(--text-sm)' }}>Required field</span>
                    </label>
                    {(editingField?.type === 'TEXT' || editingField?.type === 'CHECKBOX') && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={fieldForClient}
                                onChange={(e) => setFieldForClient(e.target.checked)}
                            />
                            <span style={{ fontSize: 'var(--text-sm)' }}>Client Field (Editable by Client only)</span>
                        </label>
                    )}
                </div>
            </Modal>
        </form>
    );
}
