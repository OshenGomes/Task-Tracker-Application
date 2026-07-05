import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import TaskFormPage from './pages/TaskFormPage';

const getStoredUser = () => {
  const user = localStorage.getItem('task-tracker-user');
  return user ? JSON.parse(user) : null;
};

function App() {
  const user = getStoredUser();

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
