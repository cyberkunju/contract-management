import { useState } from 'react';
import { Modal, Button } from '../../ui';
import styles from './HelpModal.module.css';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const [page, setPage] = useState(0);

    const PAGES = [
        {
            title: "1. Getting Started & Dashboard",
            content: (
                <div className={styles.contentWrapper}>
                    <p>
                        Welcome to the <strong>Contract Management Platform</strong>. This systematic tool allows you to design contract templates (Blueprints), create instances (Contracts), and manage their lifecycle from drafting to final signature.
                    </p>

                    <div className={styles.dashboardGrid}>
                        <div className={styles.infoBox}>
                            <h4 className={styles.boxTitle}>Dashboard Overview</h4>
                            <p className={styles.boxText}>
                                Your central hub for tracking all contracts. Use the <strong>Filter Tabs</strong> at the top to switch views:
                            </p>
                            <ul className={styles.list}>
                                <li><strong>Active:</strong> Contracts being drafted or approved internally.</li>
                                <li><strong>Pending:</strong> Contracts sent to clients, awaiting signature.</li>
                                <li><strong>Signed:</strong> Completed contracts.</li>
                                <li><strong>Archived:</strong> Contracts that were revoked/cancelled.</li>
                            </ul>
                        </div>
                        <div className={styles.infoBox}>
                            <h4 className={styles.boxTitle}>Search & Navigation</h4>
                            <p className={styles.boxText}>
                                • <strong>Search Icon:</strong> Instantly find contracts by name or blueprint type.<br /><br />
                                • <strong>New Contract Button:</strong> The starting point for everything. Takes you to the Blueprint selection screen.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Blueprints (Templates)",
            content: (
                <div className={styles.contentWrapper}>
                    <p>
                        Every contract starts from a <strong>Blueprint</strong>. A Blueprint implies the structure (fields, labels, layout) that will be used.
                    </p>

                    <div className={styles.tutorialBox}>
                        <h4 className={styles.tutorialTitle}>How to Create a Blueprint</h4>
                        <ol className={styles.stepList}>
                            <li>Click <strong>New Contract</strong> on the Dashboard.</li>
                            <li>Select <strong>Create New Blueprint</strong> from the list.</li>
                            <li><strong>Drag and Drop</strong> tools from the bottom panel into the main area to add fields.</li>
                            <li><strong>Customize Fields:</strong> Click the "Edit" (pencil) icon on any field to:
                                <ul className={styles.subList}>
                                    <li>Set the Label (e.g., "Employee Name").</li>
                                    <li>Mark as <strong>Required</strong>.</li>
                                    <li><strong>Client Field:</strong> Check this if the CLIENT should fill this (e.g., their address). Otherwise, the MANAGER fills it.</li>
                                </ul>
                            </li>
                            <li><strong>Preview:</strong> Use the "Preview" button to test the layout before saving.</li>
                        </ol>
                    </div>

                    <p className={styles.tipText}>
                        <strong>Tip:</strong> Always include a <strong>Signature</strong> field for the client!
                    </p>
                </div>
            )
        },
        {
            title: "3. Contract Lifecycle (Manager)",
            content: (
                <div className={styles.contentWrapper}>
                    <p>
                        Once a blueprint exists, you can create real contracts. The lifecycle follows a strict path:
                    </p>

                    <div className={styles.lifecycleFlow}>
                        <span>1. CREATED</span>
                        <span>→</span>
                        <span>2. APPROVED</span>
                        <span>→</span>
                        <span>3. SENT</span>
                        <span>→</span>
                        <span>4. SIGNED</span>
                        <span>→</span>
                        <span>5. LOCKED</span>
                    </div>

                    <ul className={styles.lifecycleList}>
                        <li><strong>Drafting (Created):</strong> You (Manager) fill in the details. Fields marked "Client Only" are disabled for you.</li>
                        <li><strong>Approving:</strong> Once drafted, click "Approve". The contract is now internal-ready. You can revert to draft if needed.</li>
                        <li><strong>Sending:</strong> Click "Send to Client". You will enter an email address. The status moves to <strong>SENT</strong>.</li>
                        <li><strong>Revoking:</strong> At any point (even after sending), you can <strong>Revoke</strong> the contract if you made a mistake. It will be moved to Archive.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "4. Client Interaction & Finalization",
            content: (
                <div className={styles.contentWrapper}>
                    <p>
                        When a contract is in the <strong>SENT</strong> stage, the "Ball is in the Client's court".
                    </p>

                    <div className={styles.simulationBox}>
                        <h4 className={styles.simulationTitle}>Simulating Client View</h4>
                        <p className={styles.boxText}>
                            Since this is a simulator, you can toggle your "Role" by using the available buttons:
                        </p>
                        <ul className={styles.list}>
                            <li><strong>Sign Contract:</strong> Acts as the Client. Opens the signature pad. Use your mouse to draw a signature.</li>
                            <li><strong>Reject:</strong> Acts as the Client refusing terms. You must provide a reason.</li>
                        </ul>
                    </div>

                    <div className={styles.finalizingBox}>
                        <h4 className={styles.boxTitle}>Finalizing</h4>
                        <p style={{ fontSize: '13px' }}>
                            Once the Client signs, the status becomes <strong>SIGNED</strong>. The Manager should review it one last time and click <strong>Lock Contract</strong> to make it immutable and complete the process.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const hasNext = page < PAGES.length - 1;
    const hasPrev = page > 0;

    const handleNext = () => setPage(p => Math.min(p + 1, PAGES.length - 1));
    const handlePrev = () => setPage(p => Math.max(p - 1, 0));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={PAGES[page].title}
            size="xl"
            footer={
                <div className={styles.footer}>
                    <Button
                        variant="secondary"
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        style={{ visibility: hasPrev ? 'visible' : 'hidden' }}
                    >
                        Previous
                    </Button>

                    <div className={styles.pageIndicator}>
                        Page {page + 1} of {PAGES.length}
                    </div>

                    <div className={styles.footerActions}>
                        {hasNext ? (
                            <Button onClick={handleNext}>
                                Next Step
                            </Button>
                        ) : (
                            <Button onClick={onClose} variant="primary">
                                Finish Guide
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <div className={styles.contentContainer}>
                {PAGES[page].content}
            </div>
        </Modal>
    );
}
