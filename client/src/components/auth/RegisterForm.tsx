import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, type RegisterData } from '../../services/auth.service';
import { useAppStore } from '../../store';
import styles from './AuthForm.module.css';

interface RegisterFormProps {
  onSuccess?: () => void;
}

/**
 * Registration form component
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      // Invalidate and refetch the current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setUser(data.user);
      setError(null);

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to email verification page after registration
        navigate('/auth/verify-email');
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
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

    registerMutation.mutate({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2 className={styles.title}>Create Account</h2>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          placeholder="Your name"
          autoComplete="name"
          required
          disabled={registerMutation.isPending}
        />
      </div>

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
          disabled={registerMutation.isPending}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
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
          disabled={registerMutation.isPending}
        />
        <small className={styles.hint}>
          Your password must include the following:
          <br />
          8–128 characters
          <br />
          Upper & lowercase letters
          <br />
          At least one number and one special character
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm Password
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
          disabled={registerMutation.isPending}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
      </button>

      <div className={styles.links}>
        <span>Already have an account?</span>
        <a href="/auth/login" className={styles.link}>
          Login
        </a>
      </div>
    </form>
  );
};
