import { Outlet, Link } from 'react-router-dom';
import { useAppStore } from './store';
import './App.css';

function App() {
  const { sidebarOpen, toggleSidebar, theme } = useAppStore();

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
            {/* Placeholder for future actions */}
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
