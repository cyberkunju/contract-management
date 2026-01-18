/**
 * Layout Component
 * Main application layout with header and navigation
 */

import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useUIStore } from '../../stores';
import { Button } from '../ui';
import styles from './Layout.module.css';

export function Layout() {
    const { theme, toggleTheme } = useUIStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <NavLink to="/" className={styles.logo}>
                        CONTRACT MANAGEMENT
                    </NavLink>
                    <nav className={styles.nav}>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                            }
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/blueprints"
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                            }
                        >
                            Blueprints
                        </NavLink>
                    </nav>
                    <div className={styles.themeToggleWrapper}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            )}
                        </Button>
                    </div>
                </div>
            </header>
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

/** Page header with title, description, and actions */
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className={styles.pageHeader}>
            <div>
                <h1 className={styles.pageTitle}>{title}</h1>
                {description && <p className={styles.pageDescription}>{description}</p>}
            </div>
            {actions && <div className={styles.pageActions}>{actions}</div>}
        </div>
    );
}
