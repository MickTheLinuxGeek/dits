import styles from './AuthPage.module.css';

interface AuthPageProps {
  children: React.ReactNode;
}

/**
 * Auth page layout wrapper
 */
export const AuthPage: React.FC<AuthPageProps> = ({ children }) => {
  return (
    <div className={styles.authPage}>
      <div className={styles.container}>
        <div className={styles.branding}>
          <h1 className={styles.logo}>DITS</h1>
          <p className={styles.tagline}>Developer Issue Tracking System</p>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
