import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  authService,
  type PasswordResetRequest,
} from '../../services/auth.service';
import styles from './AuthForm.module.css';

/**
 * Forgot password form component
 */
export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: (data: PasswordResetRequest) =>
      authService.requestPasswordReset(data),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setEmail('');
    },
    onError: (error: Error) => {
      setError(
        error.message || 'Failed to send reset email. Please try again.',
      );
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    resetMutation.mutate({ email });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2 className={styles.title}>Reset Password</h2>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success} role="status">
          Password reset instructions have been sent to your email.
        </div>
      )}

      <p
        style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#6b7280',
        }}
      >
        Enter your email address and we'll send you instructions to reset your
        password.
      </p>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="your@email.com"
          autoComplete="email"
          required
          disabled={resetMutation.isPending}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending ? 'Sending...' : 'Send Reset Instructions'}
      </button>

      <div className={styles.links}>
        <a href="/auth/login" className={styles.link}>
          Back to Login
        </a>
      </div>
    </form>
  );
};
