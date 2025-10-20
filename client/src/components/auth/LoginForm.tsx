import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  type LoginCredentials,
} from '../../services/auth.service';
import { useAppStore } from '../../store';
import styles from './AuthForm.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * Login form component with email, password, and remember me
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate and refetch the current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setUser(data.user);
      setError(null);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/inbox');
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    loginMutation.mutate({ email, password, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2 className={styles.title}>Login to DITS</h2>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

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
          disabled={loginMutation.isPending}
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
          autoComplete="current-password"
          required
          disabled={loginMutation.isPending}
        />
      </div>

      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.checkbox}
            disabled={loginMutation.isPending}
          />
          <span>Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>

      <div className={styles.links}>
        <a href="/auth/forgot-password" className={styles.link}>
          Forgot password?
        </a>
        <span className={styles.separator}>•</span>
        <a href="/auth/register" className={styles.link}>
          Create account
        </a>
      </div>
    </form>
  );
};
