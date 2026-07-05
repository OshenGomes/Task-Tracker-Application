import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type TaskItem = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  userId: number;
};

function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskItem | null>(null);

  const loadTask = () => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    const foundTask = allTasks.find((item) => item.id === Number(id) && item.userId === user.id);
    setTask(foundTask ?? null);
  };

  useEffect(() => {
    loadTask();

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'task-tracker-tasks' || event.key === 'task-tracker-user') {
        loadTask();
      }
    };

    const handleTaskUpdate = () => {
      loadTask();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('task-tracker-updated', handleTaskUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('task-tracker-updated', handleTaskUpdate);
    };
  }, [id, navigate]);

  const deleteTask = () => {
    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    const updatedTasks = allTasks.filter((item) => item.id !== Number(id));
    localStorage.setItem('task-tracker-tasks', JSON.stringify(updatedTasks));
    window.dispatchEvent(new Event('task-tracker-updated'));
    navigate('/');
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
            <button onClick={deleteTask}>Delete</button>
          </div>
        </div>
        <p>{task.description || 'No description provided.'}</p>
        <Link to="/">Back to tasks</Link>
      </div>
    </div>
  );
}

export default TaskDetailsPage;
