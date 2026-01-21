/**
 * Dashboard Page
 * Contract listing with filters, search, and status grouping
 * Implements Trap A resolution: status-to-filter mapping
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContractStore } from '../../stores';
import { PageHeader } from '../../components/Layout';
import { Button, Badge, Table, type Column } from '../../components/ui';
import type { Contract, DashboardFilter } from '../../types';
import { STATUS_LABELS, FILTER_LABELS } from '../../types';
import { getStatusesForFilter } from '../../utils/stateMachine';
import { formatDate, getRelativeTime } from '../../utils/helpers';
import styles from './Dashboard.module.css';

const FILTERS: DashboardFilter[] = ['ALL', 'ACTIVE', 'PENDING', 'SIGNED', 'ARCHIVED'];

export function Dashboard() {
    const navigate = useNavigate();
    const contracts = useContractStore((state) => state.contracts);
    const [activeFilter, setActiveFilter] = useState<DashboardFilter>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Filter contracts by status category
    const filteredContracts = useMemo(() => {
        let result = contracts;

        // Apply status filter
        if (activeFilter !== 'ALL') {
            const validStatuses = getStatusesForFilter(activeFilter);
            result = result.filter((c) => validStatuses.includes(c.status));
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(query) ||
                    c.blueprintName.toLowerCase().includes(query)
            );
        }

        // Sort by most recent first
        return [...result].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [contracts, activeFilter, searchQuery]);

    // Count contracts per filter
    const filterCounts = useMemo(() => {
        const counts: Record<DashboardFilter, number> = {
            ALL: contracts.length,
            ACTIVE: 0,
            PENDING: 0,
            SIGNED: 0,
            ARCHIVED: 0,
        };

        contracts.forEach((contract) => {
            // Map status to filter using Trap A resolution
            if (['CREATED', 'APPROVED'].includes(contract.status)) {
                counts.ACTIVE++;
            } else if (contract.status === 'SENT') {
                counts.PENDING++;
            } else if (['SIGNED', 'LOCKED'].includes(contract.status)) {
                counts.SIGNED++;
            } else if (contract.status === 'REVOKED') {
                counts.ARCHIVED++;
            }
        });

        return counts;
    }, [contracts]);

    const columns: Column<Contract>[] = [
        {
            key: 'name',
            header: 'Contract Name',
            render: (contract) => (
                <Link to={`/contracts/${contract.id}`} className={styles.contractName}>
                    {contract.name}
                </Link>
            ),
        },
        {
            key: 'blueprint',
            header: 'Blueprint',
            render: (contract) => contract.blueprintName,
        },
        {
            key: 'status',
            header: 'Status',
            render: (contract) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <Badge variant={contract.status}>{STATUS_LABELS[contract.status]}</Badge>
                    {contract.status === 'REVOKED' && contract.revocationReason && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={contract.revocationReason}>
                            "{contract.revocationReason}"
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (contract) => (
                <span title={formatDate(contract.createdAt)}>
                    {getRelativeTime(contract.createdAt)}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            width: '100px',
            render: (contract) => (
                <div className={styles.tableActions}>
                    <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                        tooltip="View details"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="8" cy="8" r="3" />
                            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                        </svg>
                    </Button>
                </div>
            ),
        },
    ];

    const emptyStateMessage = {
        ALL: {
            title: 'No contracts yet',
            description: 'Create your first contract to get started',
        },
        ACTIVE: {
            title: 'No active contracts',
            description: 'Contracts in Created or Approved status will appear here',
        },
        PENDING: {
            title: 'No pending contracts',
            description: 'Contracts that have been sent will appear here',
        },
        SIGNED: {
            title: 'No signed contracts',
            description: 'Signed and locked contracts will appear here',
        },
        ARCHIVED: {
            title: 'No archived contracts',
            description: 'Revoked contracts will appear here',
        },
    };

    return (
        <div className={styles.dashboard}>
            <PageHeader
                title="Dashboard"
                description="Manage your contracts"
                actions={
                    <Link to="/contracts/new">
                        <Button tooltip="Draft a new contract">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v10M3 8h10" />
                            </svg>
                            New Contract
                        </Button>
                    </Link>
                }
            />

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{filterCounts.ALL}</span>
                    <span className={styles.statLabel}>Total Contracts</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{filterCounts.ACTIVE}</span>
                    <span className={styles.statLabel}>Active</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{filterCounts.PENDING}</span>
                    <span className={styles.statLabel}>Pending</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{filterCounts.SIGNED}</span>
                    <span className={styles.statLabel}>Signed</span>
                </div>
            </div>

            {/* Controls Bar */}
            <div className={styles.controlsBar}>
                <div className={styles.filterTabs}>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {FILTER_LABELS[filter]}
                            <span className={styles.filterTabCount}>{filterCounts[filter]}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.searchSection}>
                    <button
                        className={styles.mobileSearchToggle}
                        onClick={() => setIsSearchExpanded(true)}
                        aria-label="Open search"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>

                    <div className={`${styles.searchWrapper} ${isSearchExpanded ? styles.searchExpanded : ''}`}>
                        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="7" cy="7" r="4" />
                            <path d="M10 10l4 4" />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search contracts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearchExpanded && (
                            <button
                                className={styles.closeSearchBtn}
                                onClick={() => setIsSearchExpanded(false)}
                                aria-label="Close search"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Contracts Table */}
            <Table
                data={filteredContracts}
                columns={columns}
                getRowKey={(contract) => contract.id}
                onRowClick={(contract) => navigate(`/contracts/${contract.id}`)}
                emptyState={
                    <div className={styles.emptyState}>
                        <svg className={styles.emptyIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="8" y="8" width="48" height="48" rx="4" />
                            <path d="M20 24h24M20 32h16M20 40h20" />
                        </svg>
                        <h2 className={styles.emptyTitle}>{emptyStateMessage[activeFilter].title}</h2>
                        <p className={styles.emptyDescription}>
                            {searchQuery
                                ? 'No contracts match your search'
                                : emptyStateMessage[activeFilter].description}
                        </p>
                        {activeFilter === 'ALL' && !searchQuery && (
                            <Link to="/contracts/new">
                                <Button>Create Contract</Button>
                            </Link>
                        )}
                    </div>
                }
            />
        </div>
    );
}
