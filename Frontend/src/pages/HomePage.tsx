import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type TaskItem = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  userId: number;
};

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);

    const storedTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    setTasks(storedTasks.filter((task) => task.userId === parsedUser.id));
  }, [navigate]);

  const addTask = () => {
    if (!user || !title.trim()) return;

    const newTask: TaskItem = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      userId: user.id
    };

    const updatedTasks = [...tasks, newTask];
    localStorage.setItem('task-tracker-tasks', JSON.stringify([...JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]'), newTask]));
    setTasks(updatedTasks);
    setTitle('');
    setDescription('');
  };

  const toggleTask = (taskId: number) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    const mergedTasks = allTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
    localStorage.setItem('task-tracker-tasks', JSON.stringify(mergedTasks));
    setTasks(updatedTasks);
  };

  const logout = () => {
    localStorage.removeItem('task-tracker-user');
    navigate('/login');
  };

  const summary = useMemo(() => {
    const completedCount = tasks.filter((task) => task.completed).length;
    return { total: tasks.length, completed: completedCount };
  }, [tasks]);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h2>Welcome, {user?.name}</h2>
            <p>Your personal task list</p>
          </div>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="summary-box">
          <div>
            <strong>{summary.total}</strong>
            <span>Total tasks</span>
          </div>
          <div>
            <strong>{summary.completed}</strong>
            <span>Completed</span>
          </div>
        </div>

        <div className="task-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <button onClick={addTask}>Add Task</button>
        </div>

        <div className="task-actions-row">
          <Link to="/tasks/new" className="link-btn">Create New Task</Link>
        </div>

        <div className="task-list">
          {tasks.length === 0 ? <p>No tasks yet. Add your first one.</p> : tasks.map((task) => (
            <div className={`task-item ${task.completed ? 'done' : ''}`} key={task.id}>
              <label>
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </div>
              </label>
              <div className="task-item-actions">
                <Link to={`/task/${task.id}`}>View</Link>
                <Link to={`/task/${task.id}/edit`}>Edit</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
