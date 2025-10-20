import { Outlet, Link } from 'react-router-dom';
import { useAppStore } from './store';
import { useLogout } from './hooks/useLogout';
import './App.css';

function App() {
  const { sidebarOpen, toggleSidebar, theme, user } = useAppStore();
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className="app" data-theme={theme}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <button onClick={toggleSidebar} className="sidebar-toggle">
            ☰
          </button>
          <h1>DITS</h1>
          <div className="header-actions">
            {user && (
              <>
                <span style={{ marginRight: '1rem' }}>{user.name}</span>
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: '#fff',
                  }}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="app-layout">
        {/* Sidebar Navigation */}
        {sidebarOpen && (
          <aside className="sidebar">
            <nav>
              <ul>
                <li>
                  <Link to="/inbox">📥 Inbox</Link>
                </li>
                <li>
                  <Link to="/today">📅 Today</Link>
                </li>
                <li>
                  <Link to="/upcoming">🔜 Upcoming</Link>
                </li>
                <li>
                  <Link to="/logbook">📚 Logbook</Link>
                </li>
                <li>
                  <Link to="/projects">📂 Projects</Link>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
