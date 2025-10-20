import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { ProtectedRoute } from '../components/auth';
import { AuthPage } from '../pages/AuthPage';
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  VerifyEmail,
} from '../components/auth';

/**
 * Application routes configuration
 * Using React Router v6 with data router pattern
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/inbox" replace />,
      },
      {
        path: 'inbox',
        lazy: async () => {
          // Placeholder for future inbox view
          return {
            Component: () => (
              <div>
                <h1>Inbox</h1>
                <p>Default destination for newly captured issues</p>
              </div>
            ),
          };
        },
      },
      {
        path: 'today',
        lazy: async () => {
          // Placeholder for future today view
          return {
            Component: () => (
              <div>
                <h1>Today</h1>
                <p>Curated list for current day</p>
              </div>
            ),
          };
        },
      },
      {
        path: 'upcoming',
        lazy: async () => {
          // Placeholder for future upcoming view
          return {
            Component: () => (
              <div>
                <h1>Upcoming</h1>
                <p>Chronological view with scheduled dates</p>
              </div>
            ),
          };
        },
      },
      {
        path: 'logbook',
        lazy: async () => {
          // Placeholder for future logbook view
          return {
            Component: () => (
              <div>
                <h1>Logbook</h1>
                <p>Archive of completed issues</p>
              </div>
            ),
          };
        },
      },
      {
        path: 'projects',
        lazy: async () => {
          // Placeholder for future projects view
          return {
            Component: () => (
              <div>
                <h1>Projects</h1>
                <p>Manage your projects</p>
              </div>
            ),
          };
        },
      },
      {
        path: 'projects/:id',
        lazy: async () => {
          // Placeholder for future project detail view
          return {
            Component: () => (
              <div>
                <h1>Project Details</h1>
                <p>Project detail view</p>
              </div>
            ),
          };
        },
      },
      {
        path: 'issues/:id',
        lazy: async () => {
          // Placeholder for future issue detail view
          return {
            Component: () => (
              <div>
                <h1>Issue Details</h1>
                <p>Issue detail view</p>
              </div>
            ),
          };
        },
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <AuthPage>
            <LoginForm />
          </AuthPage>
        ),
      },
      {
        path: 'register',
        element: (
          <AuthPage>
            <RegisterForm />
          </AuthPage>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <AuthPage>
            <ForgotPasswordForm />
          </AuthPage>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <AuthPage>
            <ResetPasswordForm />
          </AuthPage>
        ),
      },
      {
        path: 'verify-email',
        element: (
          <AuthPage>
            <VerifyEmail />
          </AuthPage>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <div>
        <h1>404 - Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    ),
  },
]);
