import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  authService,
  type PasswordResetConfirm,
} from '../../services/auth.service';
import styles from './AuthForm.module.css';

/**
 * Reset password confirmation form component
 */
export const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const resetMutation = useMutation({
    mutationFn: (data: PasswordResetConfirm) =>
      authService.confirmPasswordReset(data),
    onSuccess: () => {
      setError(null);
      // Redirect to login with success message
      navigate('/auth/login?reset=success');
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to reset password. Please try again.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    resetMutation.mutate({ token, newPassword: password });
  };

  if (!token) {
    return (
      <div className={styles.authForm}>
        <h2 className={styles.title}>Invalid Link</h2>
        <div className={styles.error}>
          This password reset link is invalid or has expired.
        </div>
        <div className={styles.links}>
          <a href="/auth/forgot-password" className={styles.link}>
            Request new reset link
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2 className={styles.title}>Set New Password</h2>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={resetMutation.isPending}
        />
        <small className={styles.hint}>At least 8 characters</small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={resetMutation.isPending}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
      </button>

      <div className={styles.links}>
        <a href="/auth/login" className={styles.link}>
          Back to Login
        </a>
      </div>
    </form>
  );
};
