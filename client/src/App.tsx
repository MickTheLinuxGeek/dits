import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout';
import './App.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
