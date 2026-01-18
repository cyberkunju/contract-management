/**
 * Blueprint Store
 * Manages blueprint state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Blueprint, BlueprintCreateInput, BlueprintUpdateInput, BlueprintField } from '../types';
import { generateId, getCurrentTimestamp } from '../utils';
import { DEFAULT_BLUEPRINTS } from '../data/defaultBlueprints';

interface BlueprintState {
    /** All blueprints */
    blueprints: Blueprint[];
    /** Loading state */
    isLoading: boolean;

    /** Get a single blueprint by ID */
    getBlueprint: (id: string) => Blueprint | undefined;
    /** Create a new blueprint */
    addBlueprint: (input: BlueprintCreateInput) => Blueprint;
    /** Update an existing blueprint */
    updateBlueprint: (id: string, updates: BlueprintUpdateInput) => Blueprint | undefined;
    /** Delete a blueprint */
    deleteBlueprint: (id: string) => boolean;
    /** Add a field to a blueprint */
    addField: (blueprintId: string, field: Omit<BlueprintField, 'id' | 'position'>) => BlueprintField | undefined;
    /** Update a field in a blueprint */
    updateField: (blueprintId: string, fieldId: string, updates: Partial<BlueprintField>) => boolean;
    /** Delete a field from a blueprint */
    deleteField: (blueprintId: string, fieldId: string) => boolean;
    /** Reorder fields in a blueprint */
    reorderFields: (blueprintId: string, fieldId: string, direction: 'up' | 'down') => boolean;
}

export const useBlueprintStore = create<BlueprintState>()(
    persist(
        (set, get) => ({
            blueprints: DEFAULT_BLUEPRINTS,
            isLoading: false,

            getBlueprint: (id) => {
                return get().blueprints.find((bp) => bp.id === id);
            },

            addBlueprint: (input) => {
                const now = getCurrentTimestamp();
                const blueprint: Blueprint = {
                    ...input,
                    id: generateId(),
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({
                    blueprints: [...state.blueprints, blueprint],
                }));
                return blueprint;
            },

            updateBlueprint: (id, updates) => {
                let updated: Blueprint | undefined;
                set((state) => ({
                    blueprints: state.blueprints.map((bp) => {
                        if (bp.id === id) {
                            updated = {
                                ...bp,
                                ...updates,
                                updatedAt: getCurrentTimestamp(),
                            };
                            return updated;
                        }
                        return bp;
                    }),
                }));
                return updated;
            },

            deleteBlueprint: (id) => {
                const exists = get().blueprints.some((bp) => bp.id === id);
                if (exists) {
                    set((state) => ({
                        blueprints: state.blueprints.filter((bp) => bp.id !== id),
                    }));
                }
                return exists;
            },

            addField: (blueprintId, fieldData) => {
                const blueprint = get().getBlueprint(blueprintId);
                if (!blueprint) return undefined;

                const field: BlueprintField = {
                    ...fieldData,
                    id: generateId(),
                    position: blueprint.fields.length,
                };

                get().updateBlueprint(blueprintId, {
                    fields: [...blueprint.fields, field],
                });

                return field;
            },

            updateField: (blueprintId, fieldId, updates) => {
                const blueprint = get().getBlueprint(blueprintId);
                if (!blueprint) return false;

                const fieldExists = blueprint.fields.some((f) => f.id === fieldId);
                if (!fieldExists) return false;

                get().updateBlueprint(blueprintId, {
                    fields: blueprint.fields.map((f) =>
                        f.id === fieldId ? { ...f, ...updates } : f
                    ),
                });

                return true;
            },

            deleteField: (blueprintId, fieldId) => {
                const blueprint = get().getBlueprint(blueprintId);
                if (!blueprint) return false;

                const newFields = blueprint.fields
                    .filter((f) => f.id !== fieldId)
                    .map((f, index) => ({ ...f, position: index }));

                get().updateBlueprint(blueprintId, { fields: newFields });
                return true;
            },

            reorderFields: (blueprintId, fieldId, direction) => {
                const blueprint = get().getBlueprint(blueprintId);
                if (!blueprint) return false;

                const fieldIndex = blueprint.fields.findIndex((f) => f.id === fieldId);
                if (fieldIndex === -1) return false;

                const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
                if (newIndex < 0 || newIndex >= blueprint.fields.length) return false;

                const newFields = [...blueprint.fields];
                [newFields[fieldIndex], newFields[newIndex]] = [newFields[newIndex], newFields[fieldIndex]];

                // Update positions
                const reorderedFields = newFields.map((f, index) => ({
                    ...f,
                    position: index,
                }));

                get().updateBlueprint(blueprintId, { fields: reorderedFields });
                return true;
            },
        }),
        {
            name: 'eurosys_blueprints',
            // Merge defaults with persisted data to ensure templates always exist
            merge: (persistedState, currentState) => {
                const persisted = persistedState as BlueprintState;
                // Start with all default blueprints
                const defaultIds = new Set(DEFAULT_BLUEPRINTS.map(b => b.id));
                // Add any user-created blueprints (non-default IDs)
                const userBlueprints = (persisted?.blueprints || []).filter(
                    b => !defaultIds.has(b.id)
                );
                return {
                    ...currentState,
                    ...persisted,
                    blueprints: [...DEFAULT_BLUEPRINTS, ...userBlueprints],
                };
            },
        }
    )
);
