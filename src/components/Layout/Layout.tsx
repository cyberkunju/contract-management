/**
 * Layout Component
 * Main application layout with header and navigation
 */

import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
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
