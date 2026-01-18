/**
 * ContractView Page
 * View contract details, fill fields, and manage lifecycle transitions
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContractStore } from '../../../stores';
import { Button, Badge, Input, Modal, useToast } from '../../../components/ui';
import { SignaturePad } from '../../../components/features';
import { STATUS_LABELS, type ContractStatus, type ContractField } from '../../../types';
import {
    getValidTransitions,
    isEditable,
    isTerminal,
    TRANSITION_LABELS,
} from '../../../utils/stateMachine';
import { formatDate } from '../../../utils/helpers';
import styles from './ContractView.module.css';

const LIFECYCLE_STEPS: ContractStatus[] = ['CREATED', 'APPROVED', 'SENT', 'SIGNED', 'LOCKED'];

export function ContractView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { getContract, updateContractFields, transitionStatus, deleteContract } = useContractStore();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTransitionModal, setShowTransitionModal] = useState<ContractStatus | null>(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showSignModal, setShowSignModal] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [modalSignature, setModalSignature] = useState<string | null>(null);

    const contract = id ? getContract(id) : undefined;

    if (!contract) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Contract Not Found</h1>
                <p>The contract you're looking for doesn't exist.</p>
                <Link to="/">
                    <Button style={{ marginTop: 'var(--space-4)' }}>Go to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const canEdit = isEditable(contract.status);
    const terminalState = isTerminal(contract.status);
    const validTransitions = getValidTransitions(contract.status);

    // Determine signature status based on contract status
    const getSignatureStatus = (): 'drafting' | 'pending' | 'ready' | 'signed' => {
        if (contract.status === 'CREATED' || contract.status === 'APPROVED') return 'drafting';
        if (contract.status === 'SENT') return 'pending';
        if (contract.status === 'SIGNED' || contract.status === 'LOCKED') return 'signed';
        return 'drafting';
    };

    const handleFieldChange = (fieldId: string, value: string | boolean | null) => {
        const updatedFields = contract.fields.map((f) =>
            f.id === fieldId ? { ...f, value } : f
        );
        updateContractFields(contract.id, updatedFields);
    };

    const handleTransition = (newStatus: ContractStatus) => {
        transitionStatus(contract.id, newStatus);
        setShowTransitionModal(null);

        // Story-telling toast messages based on action
        const toastMessages: Record<ContractStatus, string> = {
            CREATED: 'Contract reverted to draft. You can now edit fields.',
            APPROVED: 'Contract approved internally. Ready to send to client.',
            SENT: 'Contract sent to client.',
            SIGNED: 'Contract has been signed.',
            LOCKED: 'Contract locked and archived. No further changes possible.',
            REVOKED: 'Contract revoked and moved to archive.',
        };
        showToast(toastMessages[newStatus] || `Status changed to ${STATUS_LABELS[newStatus]}`);
    };

    const handleSendContract = () => {
        if (!recipientEmail.trim()) return;

        transitionStatus(contract.id, 'SENT');
        setShowSendModal(false);
        showToast(`Email sent to ${recipientEmail} (simulated). Awaiting client signature.`);
        setRecipientEmail('');
        setEmailMessage('');
    };

    const handleSignContract = () => {
        // Save the signature to the signature field if it exists
        const signatureField = contract.fields.find(f => f.type === 'SIGNATURE');
        if (signatureField && modalSignature) {
            const updatedFields = contract.fields.map((f) =>
                f.id === signatureField.id ? { ...f, value: modalSignature } : f
            );
            updateContractFields(contract.id, updatedFields);
        }

        transitionStatus(contract.id, 'SIGNED');
        setShowSignModal(false);
        setModalSignature(null);
        showToast('Client signature recorded successfully. Ready to lock.');
    };

    const handleDelete = () => {
        deleteContract(contract.id);
        navigate('/');
    };

    const getStepStatus = (step: ContractStatus): 'completed' | 'current' | 'pending' | 'revoked' => {
        if (contract.status === 'REVOKED') {
            const stepIndex = LIFECYCLE_STEPS.indexOf(step);
            const currentIndex = LIFECYCLE_STEPS.indexOf(contract.status);
            return stepIndex <= currentIndex ? 'completed' : 'pending';
        }

        const stepIndex = LIFECYCLE_STEPS.indexOf(step);
        const currentIndex = LIFECYCLE_STEPS.indexOf(contract.status);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    const renderField = (field: ContractField) => {
        // Determine if field is disabled based on role and status
        const isManagerField = !field.editableBy || field.editableBy === 'manager' || field.editableBy === 'both';
        const isClientField = field.editableBy === 'client' || field.editableBy === 'both';

        const isCreated = contract.status === 'CREATED';
        const isSent = contract.status === 'SENT';

        let isDisabled = true;
        if (isCreated) {
            // Manager View (Draft): Manager fields enabled, Client fields disabled
            isDisabled = !isManagerField;
        } else if (isSent) {
            // Client View (Received): Client fields enabled, Manager fields disabled
            isDisabled = !isClientField;
        }
        // All other states (APPROVED, SIGNED, LOCKED, REVOKED) -> Disabled

        const signatureStatus = getSignatureStatus();

        switch (field.type) {
            case 'TEXT':
                if (isDisabled) {
                    return (
                        <div key={field.id} className={styles.readOnlyField}>
                            <label className={styles.readOnlyLabel}>{field.label}</label>
                            <div className={styles.readOnlyValue}>{(field.value as string) || '—'}</div>
                        </div>
                    );
                }
                return (
                    <Input
                        key={field.id}
                        label={field.label}
                        value={(field.value as string) ?? ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={isDisabled}
                    />
                );

            case 'DATE':
                if (isDisabled) {
                    return (
                        <div key={field.id} className={styles.readOnlyField}>
                            <label className={styles.readOnlyLabel}>{field.label}</label>
                            <div className={styles.readOnlyValue}>{formatDate(field.value as string) || '—'}</div>
                        </div>
                    );
                }
                return (
                    <Input
                        key={field.id}
                        type="date"
                        label={field.label}
                        value={(field.value as string) ?? ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                        disabled={isDisabled}
                    />
                );

            case 'SIGNATURE':
                return (
                    <SignaturePad
                        key={field.id}
                        label={field.label}
                        value={field.value as string | null}
                        onChange={(value) => handleFieldChange(field.id, value)}
                        required={field.required}
                        disabled={isDisabled}
                        signatureStatus={signatureStatus}
                        signerName={field.editableBy === 'client' ? "Client" : "User"}
                    />
                );

            case 'CHECKBOX':
                return (
                    <div key={field.id} className={styles.checkboxField} style={isDisabled ? { opacity: 0.8 } : undefined}>
                        <input
                            type="checkbox"
                            id={field.id}
                            className={styles.checkboxInput}
                            checked={(field.value as boolean) ?? false}
                            onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                            disabled={isDisabled}
                        />
                        <label htmlFor={field.id} className={styles.checkboxLabel} style={{ cursor: isDisabled ? 'default' : 'pointer' }}>
                            {field.label}
                            {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                        </label>
                    </div>
                );

            default:
                return null;
        }
    };

    const validateClientFields = (): string[] => {
        return contract.fields
            .filter(f =>
                (f.editableBy === 'client' || f.editableBy === 'both') && // Client editable
                f.required && // Required
                f.type !== 'SIGNATURE' && // Not signature
                (!f.value || (typeof f.value === 'string' && !f.value.trim()) || (f.type === 'CHECKBOX' && f.value !== true)) // Empty/Unchecked
            )
            .map(f => f.label);
    };

    // Custom action buttons based on status
    const renderActions = () => {
        if (terminalState) {
            return (
                <div className={styles.terminalNotice}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="10" height="8" rx="1" />
                        <path d="M5 5V3.5C5 2.67 5.67 2 6.5 2h3c.83 0 1.5.67 1.5 1.5V5" />
                    </svg>
                    {contract.status === 'REVOKED'
                        ? 'This contract has been revoked.'
                        : 'This contract is locked and complete.'}
                </div>
            );
        }

        return (
            <>
                <div className={styles.actionGroup}>
                    {/* Special handling for SENT -> show Sign button (Client Action) */}
                    {contract.status === 'SENT' && (
                        <Button
                            onClick={() => {
                                const missing = validateClientFields();
                                if (missing.length > 0) {
                                    showToast(`Please complete required fields: ${missing.join(', ')}`);
                                    return;
                                }
                                setShowSignModal(true);
                            }}
                            tooltip="Acting as Client: Sign the contract"
                        >
                            Sign Contract
                        </Button>
                    )}

                    {/* Show Send to Client button (Manager Action) */}
                    {validTransitions.includes('SENT') && contract.status !== 'SENT' && (
                        <Button
                            onClick={() => setShowSendModal(true)}
                            tooltip="Acting as Manager: Send to client"
                        >
                            Send to Client
                        </Button>
                    )}

                    {/* Revert to Draft - only for APPROVED status (Manager Action) */}
                    {contract.status === 'APPROVED' && validTransitions.includes('CREATED') && (
                        <Button
                            variant="secondary"
                            onClick={() => setShowTransitionModal('CREATED')}
                            tooltip="Acting as Manager: Return to draft"
                        >
                            Revert to Draft
                        </Button>
                    )}

                    {/* Other transitions - Approve (Manager Action) */}
                    {validTransitions
                        .filter((t) => t !== 'REVOKED' && t !== 'SENT' && t !== 'SIGNED' && t !== 'LOCKED' && t !== 'CREATED')
                        .map((transition) => (
                            <Button
                                key={transition}
                                onClick={() => setShowTransitionModal(transition)}
                                tooltip={transition === 'APPROVED' ? 'Acting as Manager: Approve for sending' : undefined}
                            >
                                {TRANSITION_LABELS[transition]}
                            </Button>
                        ))}

                    {/* Lock button after signed (Manager Action) */}
                    {validTransitions.includes('LOCKED') && (
                        <Button
                            onClick={() => setShowTransitionModal('LOCKED')}
                            tooltip="Acting as Manager: Lock and archive"
                        >
                            Lock Contract
                        </Button>
                    )}
                </div>

                {validTransitions.includes('REVOKED') && (
                    <Button
                        variant="danger"
                        onClick={() => setShowTransitionModal('REVOKED')}
                        tooltip="Acting as Manager: Cancel contract"
                    >
                        Revoke
                    </Button>
                )}
            </>
        );
    };

    return (
        <div className={styles.page}>
            {/* Back Link */}
            <Link to="/" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 4L6 8l4 4" />
                </svg>
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>{contract.name}</h1>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <span>{contract.blueprintName}</span>
                        </div>
                        <span className={styles.metaSeparator}>•</span>
                        <div className={styles.metaItem}>
                            <span>{formatDate(contract.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.statusSection}>
                    <Badge variant={contract.status}>{STATUS_LABELS[contract.status]}</Badge>
                </div>
            </div>

            {/* Status Timeline */}
            <div className={styles.timeline}>
                {LIFECYCLE_STEPS.map((step, index) => (
                    <>
                        <div
                            key={step}
                            className={`${styles.timelineStep} ${styles[getStepStatus(step)]}`}
                        >
                            <div className={styles.timelineIcon}>
                                {getStepStatus(step) === 'completed' ? (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 8l3 3 7-7" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className={styles.timelineLabel}>{STATUS_LABELS[step]}</span>
                        </div>
                        {index < LIFECYCLE_STEPS.length - 1 && (
                            <div key={`connector-${index}`} className={styles.timelineConnector} />
                        )}
                    </>
                ))}
                {contract.status === 'REVOKED' && (
                    <>
                        <div className={styles.timelineConnector} />
                        <div className={`${styles.timelineStep} ${styles.revoked}`}>
                            <div className={styles.timelineIcon}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4l8 8M12 4l-8 8" />
                                </svg>
                            </div>
                            <span className={styles.timelineLabel}>Revoked</span>
                        </div>
                    </>
                )}
            </div>

            {/* Draft Auto-Save Indicator */}
            {contract.status === 'CREATED' && (
                <div className={styles.draftBanner}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l2 2-8 8H4v-2l8-8z" />
                        <path d="M10 4l2 2" />
                    </svg>
                    Draft — All changes are saved automatically
                </div>
            )}

            {/* Read-only Banner */}
            {!canEdit && contract.status !== 'CREATED' && (
                <div className={styles.readOnlyBanner}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="8" cy="8" r="6" />
                        <path d="M8 5v3M8 10v.5" />
                    </svg>
                    {terminalState
                        ? `This contract is ${contract.status.toLowerCase()} and cannot be modified.`
                        : contract.status === 'SENT'
                            ? 'Please review the contract details and click "Sign Contract" to add your signature.'
                            : contract.status === 'APPROVED'
                                ? 'Contract is approved. Use "Revert to Draft" to make changes.'
                                : 'Fields cannot be edited after the contract leaves "Created" status.'}
                </div>
            )}

            {/* Fields */}
            <div className={styles.fieldsSection}>
                <h2 className={styles.sectionTitle}>Contract Fields</h2>
                {contract.fields.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        This contract has no fields.
                    </p>
                ) : (
                    <div className={styles.fieldList}>
                        {contract.fields
                            .sort((a, b) => a.position - b.position)
                            .map(renderField)}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actionsSection}>
                {renderActions()}
                <div style={{ flex: 1 }} />
                <Button variant="ghost" onClick={() => setShowDeleteModal(true)}>
                    Delete
                </Button>
            </div>

            {/* Send Contract Modal */}
            <Modal
                isOpen={showSendModal}
                onClose={() => setShowSendModal(false)}
                title="Send Contract"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowSendModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendContract} disabled={!recipientEmail.trim()}>
                            Send
                        </Button>
                    </>
                }
            >
                <div className={styles.signatureModalContent}>
                    <Input
                        label="Recipient Email"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="client@example.com"
                        required
                    />
                    <Input
                        as="textarea"
                        label="Message (Optional)"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Please review and sign this contract..."
                    />
                </div>
            </Modal>

            {/* Sign Contract Modal */}
            <Modal
                isOpen={showSignModal}
                onClose={() => {
                    setShowSignModal(false);
                    setModalSignature(null);
                }}
                title="Client Signature"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => {
                            setShowSignModal(false);
                            setModalSignature(null);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSignContract} disabled={!modalSignature}>
                            Submit Signature
                        </Button>
                    </>
                }
            >
                <div className={styles.signatureModalContent}>
                    <p className={styles.signatureModalDescription}>
                        <strong>Acting as: Client</strong><br />
                        By signing below, you confirm that you agree to the terms of this contract.
                    </p>
                    <SignaturePad
                        label="Sign as Client"
                        value={modalSignature}
                        onChange={setModalSignature}
                        signatureStatus="ready"
                        signerName="Client"
                    />
                </div>
            </Modal>

            {/* Transition Confirmation Modal */}
            <Modal
                isOpen={!!showTransitionModal}
                onClose={() => setShowTransitionModal(null)}
                title={`Confirm: ${showTransitionModal === 'CREATED' ? 'Revert to Draft' : showTransitionModal ? TRANSITION_LABELS[showTransitionModal] : ''}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowTransitionModal(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant={showTransitionModal === 'REVOKED' ? 'danger' : 'primary'}
                            onClick={() => showTransitionModal && handleTransition(showTransitionModal)}
                        >
                            {showTransitionModal === 'CREATED' ? 'Revert to Draft' : showTransitionModal ? TRANSITION_LABELS[showTransitionModal] : ''}
                        </Button>
                    </>
                }
            >
                {showTransitionModal === 'REVOKED' ? (
                    <p>
                        Are you sure you want to <strong>revoke</strong> this contract?
                        This action cannot be undone and the contract will be permanently terminated.
                    </p>
                ) : showTransitionModal === 'LOCKED' ? (
                    <p>
                        Are you sure you want to <strong>lock</strong> this contract?
                        Once locked, it cannot be modified or revoked.
                    </p>
                ) : showTransitionModal === 'CREATED' ? (
                    <p>
                        Are you sure you want to <strong>revert to draft</strong>?
                        This will allow you to edit the contract fields again before approval.
                    </p>
                ) : (
                    <p>
                        Are you sure you want to change the status to{' '}
                        <strong>{showTransitionModal ? STATUS_LABELS[showTransitionModal] : ''}</strong>?
                    </p>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Contract"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p>
                    Are you sure you want to delete <strong>{contract.name}</strong>?
                    This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
}
