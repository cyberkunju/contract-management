/**
 * Contract Create Page
 * Select a blueprint and create a new contract
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlueprintStore, useContractStore } from '../../../stores';
import { PageHeader } from '../../../components/Layout';
import { Button, Input, Card, CardBody } from '../../../components/ui';
import styles from './ContractCreate.module.css';

export function ContractCreate() {
    const navigate = useNavigate();
    const blueprints = useBlueprintStore((state) => state.blueprints);
    const createContract = useContractStore((state) => state.createContract);

    const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
    const [contractName, setContractName] = useState('');
    const [errors, setErrors] = useState<{ name?: string; blueprint?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: typeof errors = {};
        if (!contractName.trim()) {
            newErrors.name = 'Contract name is required';
        }
        if (!selectedBlueprintId) {
            newErrors.blueprint = 'Please select a blueprint';
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        const contract = createContract({
            name: contractName.trim(),
            blueprintId: selectedBlueprintId!,
        });

        if (contract) {
            navigate(`/contracts/${contract.id}`);
        }
    };

    return (
        <div className={styles.page}>
            <PageHeader
                title="Create Contract"
                description="Select a blueprint and create a new contract"
            />

            {blueprints.length === 0 ? (
                <Card>
                    <CardBody>
                        <div className={styles.noBlueprintsMessage}>
                            <p>No blueprints available. Create a blueprint first.</p>
                            <Link to="/blueprints/new">
                                <Button style={{ marginTop: 'var(--space-4)' }}>Create Blueprint</Button>
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            <Input
                                label="Contract Name"
                                value={contractName}
                                onChange={(e) => setContractName(e.target.value)}
                                placeholder="e.g., Employment Agreement - John Doe"
                                error={errors.name}
                                required
                            />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                                    Select Blueprint
                                    {errors.blueprint && (
                                        <span style={{ color: 'var(--color-error-600)', marginLeft: 'var(--space-2)' }}>
                                            {errors.blueprint}
                                        </span>
                                    )}
                                </label>
                            </div>
                            <div className={styles.blueprintSelect}>
                                {blueprints.map((blueprint) => (
                                    <div
                                        key={blueprint.id}
                                        className={`${styles.blueprintOption} ${selectedBlueprintId === blueprint.id ? styles.selected : ''
                                            }`}
                                        onClick={() => setSelectedBlueprintId(blueprint.id)}
                                        role="radio"
                                        aria-checked={selectedBlueprintId === blueprint.id}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedBlueprintId(blueprint.id);
                                            }
                                        }}
                                    >
                                        <div className={styles.blueprintOptionInfo}>
                                            <span className={styles.blueprintOptionName}>{blueprint.name}</span>
                                            <span className={styles.blueprintOptionMeta}>
                                                {blueprint.fields.length} field{blueprint.fields.length !== 1 ? 's' : ''}
                                                {blueprint.description && ` • ${blueprint.description}`}
                                            </span>
                                        </div>
                                        <div className={styles.radioIndicator} />
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    <div className={styles.formActions}>
                        <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Contract</Button>
                    </div>
                </form>
            )}
        </div>
    );
}
