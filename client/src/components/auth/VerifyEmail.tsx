import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  authService,
  type EmailVerification,
} from '../../services/auth.service';
import { useAppStore } from '../../store';
import styles from './AuthForm.module.css';

/**
 * Email verification component
 */
export const VerifyEmail: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const token = searchParams.get('token');
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');

  const verifyMutation = useMutation({
    mutationFn: (data: EmailVerification) => authService.verifyEmail(data),
    onSuccess: (data) => {
      setSuccess(true);
      setError(null);
      setUser(data.user);

      // Redirect to inbox after a brief delay
      setTimeout(() => {
        navigate('/inbox');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message || 'Email verification failed. Please try again.');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
    onSuccess: () => {
      setError(null);
      alert('Verification email resent! Please check your inbox.');
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to resend verification email.');
    },
  });

  useEffect(() => {
    // Handle redirect from backend with success/error status
    if (successParam === 'true') {
      setSuccess(true);
      setError(null);
      setIsRedirecting(true);

      // Redirect to inbox - if not authenticated, ProtectedRoute will redirect to login
      const redirectTimer = setTimeout(() => {
        navigate('/inbox');
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'invalid-token':
          'Invalid or expired verification token. Please request a new one.',
        'server-error':
          'An error occurred while verifying your email. Please try again.',
      };
      setError(errorMessages[errorParam] || 'Email verification failed.');
      return;
    }

    // Handle direct token verification (via API)
    if (token && !verifyMutation.isPending) {
      verifyMutation.mutate({ token });
    }
  }, [token, successParam, errorParam]);

  const handleResend = () => {
    resendMutation.mutate();
  };

  if (!token) {
    return (
      <div className={styles.authForm}>
        <h2 className={styles.title}>Email Verification</h2>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Check your email for a verification link.
        </p>
        <button
          onClick={handleResend}
          className={styles.submitButton}
          disabled={resendMutation.isPending}
        >
          {resendMutation.isPending
            ? 'Sending...'
            : 'Resend Verification Email'}
        </button>
        <div className={styles.links}>
          <a href="/inbox" className={styles.link}>
            Go to Inbox
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authForm}>
      <h2 className={styles.title}>Email Verification</h2>

      {verifyMutation.isPending && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Verifying your email...</p>
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success} role="status">
          {isRedirecting
            ? 'Email verified successfully! Redirecting...'
            : 'Email verified successfully!'}
        </div>
      )}

      {!verifyMutation.isPending && !success && !isRedirecting && (
        <>
          <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            Click the button below to resend the verification email.
          </p>
          <button
            onClick={handleResend}
            className={styles.submitButton}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending
              ? 'Sending...'
              : 'Resend Verification Email'}
          </button>
        </>
      )}

      {success && !isRedirecting && (
        <div className={styles.links}>
          <a href="/auth/login" className={styles.link}>
            Continue to Login
          </a>
        </div>
      )}

      {!success && (
        <div className={styles.links}>
          <a href="/auth/login" className={styles.link}>
            Back to Login
          </a>
        </div>
      )}
    </div>
  );
};
