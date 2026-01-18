/**
 * Blueprint and Field Types
 * Defines the structure for reusable contract templates
 */

/** Supported field types for blueprint configuration */
export type FieldType = 'TEXT' | 'DATE' | 'SIGNATURE' | 'CHECKBOX';

/** Field type labels for UI display */
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    TEXT: 'Text Input',
    DATE: 'Date Picker',
    SIGNATURE: 'Signature',
    CHECKBOX: 'Checkbox',
};

/** Who can edit this field */
export type FieldEditor = 'manager' | 'client' | 'both';

/** A single configurable field within a blueprint */
export interface BlueprintField {
    /** Unique identifier for the field */
    id: string;
    /** Type of input for this field */
    type: FieldType;
    /** Human-readable label displayed to users */
    label: string;
    /** Order position (0-indexed) for field arrangement */
    position: number;
    /** Whether this field must be filled before submission */
    required: boolean;
    /** Who can edit this field: manager (draft phase), client (signing phase), or both */
    editableBy?: FieldEditor;
    /** Placeholder text for TEXT type fields */
    placeholder?: string;
    /** Default checked state for CHECKBOX type fields */
    defaultChecked?: boolean;
}

/** A reusable contract template */
export interface Blueprint {
    /** Unique identifier */
    id: string;
    /** Template name */
    name: string;
    /** Optional description of the blueprint's purpose */
    description: string;
    /** Ordered list of configurable fields */
    fields: BlueprintField[];
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last modification */
    updatedAt: string;
}

/** Data required to create a new blueprint */
export type BlueprintCreateInput = Omit<Blueprint, 'id' | 'createdAt' | 'updatedAt'>;

/** Data for updating an existing blueprint */
export type BlueprintUpdateInput = Partial<BlueprintCreateInput>;
