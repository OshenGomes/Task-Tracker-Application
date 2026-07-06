import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTask, getTaskById, type TaskItem } from '../api/taskApi';

function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskItem | null>(null);
  const [error, setError] = useState('');

  const loadTask = useCallback(async () => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    const foundTask = await getTaskById(Number(id), user);
    setTask(foundTask);
    setError('');
  }, [id, navigate]);

  useEffect(() => {
    const initTask = () => {
      void loadTask();
    };

    initTask();

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'task-tracker-tasks' || event.key === 'task-tracker-user') {
        void loadTask();
      }
    };

    const handleTaskUpdate = () => {
      void loadTask();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('task-tracker-updated', handleTaskUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('task-tracker-updated', handleTaskUpdate);
    };
  }, [id, loadTask, navigate]);

  const handleDeleteTask = async () => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      await deleteTask(Number(id), JSON.parse(storedUser));
      window.dispatchEvent(new Event('task-tracker-updated'));
      navigate('/');
    } catch {
      setError('Unable to delete this task from the server.');
    }
  };

  const statusLabel = useMemo(() => (task?.completed ? 'Completed' : 'Pending'), [task]);

  if (!task) {
    return <div className="dashboard-shell"><div className="dashboard-card"><h2>Task not found</h2><Link to="/">Back to dashboard</Link></div></div>;
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h2>{task.title}</h2>
            <p>{statusLabel}</p>
          </div>
          <div className="inline-actions">
            <Link to={`/task/${task.id}/edit`} className="link-btn">Edit</Link>
            <button onClick={() => void handleDeleteTask()}>Delete</button>
          </div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <p>{task.description || 'No description provided.'}</p>
        <Link to="/">Back to tasks</Link>
      </div>
    </div>
  );
}

export default TaskDetailsPage;
