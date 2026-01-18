/**
 * Blueprint List Page
 * Displays all blueprints with create CTA
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useBlueprintStore } from '../../../stores';
import { PageHeader } from '../../../components/Layout';
import { Button, Card, CardBody, CardHeader, Modal } from '../../../components/ui';
import { formatDate } from '../../../utils';
import styles from './BlueprintList.module.css';

export function BlueprintList() {
    const navigate = useNavigate();
    const { blueprints, deleteBlueprint } = useBlueprintStore();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            deleteBlueprint(deleteId);
            setDeleteId(null);
        }
    };

    const blueprintToDelete = deleteId ? blueprints.find((b) => b.id === deleteId) : null;

    return (
        <>
            <PageHeader
                title="Blueprints"
                description="Create and manage reusable contract templates"
                actions={
                    <Link to="/blueprints/new">
                        <Button>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v10M3 8h10" />
                            </svg>
                            New Blueprint
                        </Button>
                    </Link>
                }
            />

            {blueprints.length === 0 ? (
                <div className={styles.emptyState}>
                    <svg className={styles.emptyIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="8" y="8" width="48" height="48" rx="4" />
                        <path d="M20 24h24M20 32h16M20 40h20" />
                    </svg>
                    <h2 className={styles.emptyTitle}>No blueprints yet</h2>
                    <p className={styles.emptyDescription}>
                        Create your first blueprint to start building contracts
                    </p>
                    <Link to="/blueprints/new">
                        <Button>Create Blueprint</Button>
                    </Link>
                </div>
            ) : (
                <div className={styles.blueprintGrid}>
                    {blueprints.map((blueprint) => (
                        <Card key={blueprint.id} className={styles.blueprintCard}>
                            <CardHeader
                                title={blueprint.name}
                                description={blueprint.description || 'No description'}
                                actions={
                                    <div className={styles.cardActions}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => navigate(`/blueprints/${blueprint.id}/edit`)}
                                            aria-label="Edit blueprint"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11.5 2.5a2.121 2.121 0 013 3L5 15l-4 1 1-4L11.5 2.5z" />
                                            </svg>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => setDeleteId(blueprint.id)}
                                            aria-label="Delete blueprint"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
                                            </svg>
                                        </Button>
                                    </div>
                                }
                            />
                            <CardBody>
                                <div className={styles.blueprintMeta}>
                                    <span className={styles.metaItem}>
                                        <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="2" width="12" height="12" rx="2" />
                                            <path d="M5 5h6M5 8h4M5 11h5" />
                                        </svg>
                                        <span className={styles.fieldCount}>{blueprint.fields.length}</span>
                                        field{blueprint.fields.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className={styles.metaItem}>
                                        <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="8" cy="8" r="6" />
                                            <path d="M8 4v4l2 2" />
                                        </svg>
                                        {formatDate(blueprint.updatedAt)}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Blueprint"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p>
                    Are you sure you want to delete <strong>{blueprintToDelete?.name}</strong>?
                    This action cannot be undone.
                </p>
            </Modal>
        </>
    );
}
