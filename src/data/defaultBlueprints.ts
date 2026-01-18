/**
 * Default Blueprints
 * Professional contract templates that come with fresh installation
 */

import type { Blueprint } from '../types';

const timestamp = new Date().toISOString();

export const DEFAULT_BLUEPRINTS: Blueprint[] = [
    {
        id: 'default-employment-contract',
        name: 'Employment Contract',
        description: 'Standard employment agreement defining role, compensation, and terms of engagement.',
        fields: [
            { id: 'emp-name', label: 'Employee Full Name', type: 'TEXT', required: true, position: 0 },
            { id: 'emp-position', label: 'Job Title / Position', type: 'TEXT', required: true, position: 1 },
            { id: 'emp-start-date', label: 'Start Date', type: 'DATE', required: true, position: 2 },
            { id: 'emp-salary', label: 'Annual Salary', type: 'TEXT', required: true, position: 3 },
            { id: 'emp-hours', label: 'Weekly Working Hours', type: 'TEXT', required: true, position: 4 },
            { id: 'emp-notice', label: 'Notice Period (Weeks)', type: 'TEXT', required: true, position: 5 },
            { id: 'emp-benefits', label: 'Health Insurance Included', type: 'CHECKBOX', required: false, position: 6 },
            { id: 'emp-signature', label: 'Employee Signature', type: 'SIGNATURE', required: true, editableBy: 'client', position: 7 },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
    },
    {
        id: 'default-nda',
        name: 'Non-Disclosure Agreement (NDA)',
        description: 'Strict confidentiality agreement to protect proprietary information and trade secrets.',
        fields: [
            { id: 'nda-party-name', label: 'Receiving Party Name', type: 'TEXT', required: true, position: 0 },
            { id: 'nda-company', label: 'Company / Organization', type: 'TEXT', required: false, position: 1 },
            { id: 'nda-effective-date', label: 'Effective Date', type: 'DATE', required: true, position: 2 },
            { id: 'nda-duration', label: 'Confidentiality Period (years)', type: 'TEXT', required: true, position: 3 },
            { id: 'nda-jurisdiction', label: 'Governing Law / Jurisdiction', type: 'TEXT', required: true, position: 4 },
            { id: 'nda-acknowledge', label: 'I acknowledge the terms of this NDA', type: 'CHECKBOX', required: true, editableBy: 'client', position: 5 },
            { id: 'nda-signature', label: 'Signature', type: 'SIGNATURE', required: true, editableBy: 'client', position: 6 },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
    },
    {
        id: 'default-freelance',
        name: 'Freelance Service Agreement',
        description: 'Comprehensive contract for project-based work, outlining deliverables, payment terms, and IP ownership.',
        fields: [
            { id: 'free-contractor', label: 'Contractor / Freelancer Name', type: 'TEXT', required: true, position: 0 },
            { id: 'free-project', label: 'Project Description', type: 'TEXT', required: true, position: 1 },
            { id: 'free-start', label: 'Project Start Date', type: 'DATE', required: true, position: 2 },
            { id: 'free-deadline', label: 'Delivery Deadline', type: 'DATE', required: true, position: 3 },
            { id: 'free-fee', label: 'Total Project Fee', type: 'TEXT', required: true, position: 4 },
            { id: 'free-payment-terms', label: 'Payment Terms (e.g., Net 30, 50% upfront)', type: 'TEXT', required: true, position: 5 },
            { id: 'free-ip', label: 'Client Retains IP Rights', type: 'CHECKBOX', required: false, position: 6 },
            { id: 'free-signature', label: 'Contractor Signature', type: 'SIGNATURE', required: true, editableBy: 'client', position: 7 },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
    },
    {
        id: 'default-rental',
        name: 'Rental / Lease Agreement',
        description: 'Detailed property rental agreement covering lease terms, rent, deposits, and tenant obligations.',
        fields: [
            { id: 'rent-tenant', label: 'Tenant Full Name', type: 'TEXT', required: true, position: 0 },
            { id: 'rent-address', label: 'Property Address', type: 'TEXT', required: true, position: 1 },
            { id: 'rent-start', label: 'Lease Start Date', type: 'DATE', required: true, position: 2 },
            { id: 'rent-end', label: 'Lease End Date', type: 'DATE', required: true, position: 3 },
            { id: 'rent-amount', label: 'Monthly Rent Amount', type: 'TEXT', required: true, position: 4 },
            { id: 'rent-deposit', label: 'Security Deposit', type: 'TEXT', required: true, position: 5 },
            { id: 'rent-late-fee', label: 'Late Payment Fee Policy', type: 'TEXT', required: false, position: 6 },
            { id: 'rent-pets', label: 'Pets Allowed', type: 'CHECKBOX', required: false, position: 7 },
            { id: 'rent-signature', label: 'Tenant Signature', type: 'SIGNATURE', required: true, editableBy: 'client', position: 8 },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
    },
];
