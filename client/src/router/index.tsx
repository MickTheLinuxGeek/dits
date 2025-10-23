import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { ProtectedRoute } from '../components/auth';
import { AuthPage } from '../pages/AuthPage';
import { InboxPage } from '../pages/InboxPage';
import { TodayPage } from '../pages/TodayPage';
import { UpcomingPage } from '../pages/UpcomingPage';
import { LogbookPage } from '../pages/LogbookPage';
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
        element: <InboxPage />,
      },
      {
        path: 'today',
        element: <TodayPage />,
      },
      {
        path: 'upcoming',
        element: <UpcomingPage />,
      },
      {
        path: 'logbook',
        element: <LogbookPage />,
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
