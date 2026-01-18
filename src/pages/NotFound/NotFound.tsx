/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import styles from './NotFound.module.css';

export function NotFound() {
    return (
        <div className={styles.page}>
            <div className={styles.code}>404</div>
            <h1 className={styles.title}>Page not found</h1>
            <p className={styles.description}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
                <Button>Go to Dashboard</Button>
            </Link>
        </div>
    );
}
