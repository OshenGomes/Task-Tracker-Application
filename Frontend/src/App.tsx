import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import TaskFormPage from './pages/TaskFormPage';
import type { User } from './api/taskApi';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem('task-tracker-user');
      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    };

    syncUser();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'task-tracker-user') {
        syncUser();
      }
    };

    window.addEventListener('auth-changed', syncUser);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth-changed', syncUser);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route path="/tasks/new" element={user ? <TaskFormPage /> : <Navigate to="/login" replace />} />
      <Route path="/task/:id" element={user ? <TaskDetailsPage /> : <Navigate to="/login" replace />} />
      <Route path="/task/:id/edit" element={user ? <TaskFormPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
