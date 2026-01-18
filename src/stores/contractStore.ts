/**
 * Contract Store
 * Manages contract state with lifecycle controls and localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contract, ContractCreateInput, ContractField, ContractStatus, DashboardFilter } from '../types';
import { generateId, getCurrentTimestamp, canTransition, getStatusesForFilter } from '../utils';
import { useBlueprintStore } from './blueprintStore';

interface ContractState {
    /** All contracts */
    contracts: Contract[];
    /** Loading state */
    isLoading: boolean;

    /** Get a single contract by ID */
    getContract: (id: string) => Contract | undefined;
    /** Get contracts filtered by dashboard category */
    getContractsByFilter: (filter: DashboardFilter) => Contract[];
    /** Create a new contract from a blueprint */
    createContract: (input: ContractCreateInput) => Contract | undefined;
    /** Update contract field values */
    updateContractFields: (id: string, fields: ContractField[]) => boolean;
    /** Transition contract to a new status */
    transitionStatus: (id: string, newStatus: ContractStatus) => boolean;
    /** Delete a contract */
    deleteContract: (id: string) => boolean;
    /** Search contracts by name */
    searchContracts: (query: string) => Contract[];
}

export const useContractStore = create<ContractState>()(
    persist(
        (set, get) => ({
            contracts: [],
            isLoading: false,

            getContract: (id) => {
                return get().contracts.find((c) => c.id === id);
            },

            getContractsByFilter: (filter) => {
                const contracts = get().contracts;
                const statuses = getStatusesForFilter(filter);
                return contracts.filter((c) => statuses.includes(c.status));
            },

            createContract: (input) => {
                // Get the blueprint
                const blueprint = useBlueprintStore.getState().getBlueprint(input.blueprintId);
                if (!blueprint) {
                    console.error('Blueprint not found:', input.blueprintId);
                    return undefined;
                }

                const now = getCurrentTimestamp();

                // Copy fields from blueprint with empty values
                const fields: ContractField[] = blueprint.fields.map((f) => ({
                    id: f.id,
                    type: f.type,
                    label: f.label,
                    position: f.position,
                    required: f.required,
                    editableBy: f.editableBy,
                    placeholder: f.placeholder,
                    value: f.type === 'CHECKBOX' ? (f.defaultChecked ?? false) : null,
                }));

                const contract: Contract = {
                    id: generateId(),
                    name: input.name,
                    blueprintId: blueprint.id,
                    blueprintName: blueprint.name,
                    status: 'CREATED',
                    fields,
                    createdAt: now,
                    updatedAt: now,
                };

                set((state) => ({
                    contracts: [...state.contracts, contract],
                }));

                return contract;
            },

            updateContractFields: (id, fields) => {
                const contract = get().getContract(id);
                if (!contract) return false;

                // Allow editing in CREATED state, or signature updates in SENT state
                const isCreated = contract.status === 'CREATED';
                const isSentSignature = contract.status === 'SENT';

                if (!isCreated && !isSentSignature) {
                    console.warn('Cannot edit contract in status:', contract.status);
                    return false;
                }

                set((state) => ({
                    contracts: state.contracts.map((c) =>
                        c.id === id
                            ? { ...c, fields, updatedAt: getCurrentTimestamp() }
                            : c
                    ),
                }));

                return true;
            },

            transitionStatus: (id, newStatus) => {
                const contract = get().getContract(id);
                if (!contract) {
                    console.error('Contract not found:', id);
                    return false;
                }

                // Validate transition using FSM
                if (!canTransition(contract.status, newStatus)) {
                    console.error(
                        `Invalid transition: ${contract.status} → ${newStatus}`
                    );
                    return false;
                }

                set((state) => ({
                    contracts: state.contracts.map((c) =>
                        c.id === id
                            ? { ...c, status: newStatus, updatedAt: getCurrentTimestamp() }
                            : c
                    ),
                }));

                return true;
            },

            deleteContract: (id) => {
                const exists = get().contracts.some((c) => c.id === id);
                if (exists) {
                    set((state) => ({
                        contracts: state.contracts.filter((c) => c.id !== id),
                    }));
                }
                return exists;
            },

            searchContracts: (query) => {
                const lowerQuery = query.toLowerCase();
                return get().contracts.filter(
                    (c) =>
                        c.name.toLowerCase().includes(lowerQuery) ||
                        c.blueprintName.toLowerCase().includes(lowerQuery)
                );
            },
        }),
        {
            name: 'eurosys_contracts',
        }
    )
);
