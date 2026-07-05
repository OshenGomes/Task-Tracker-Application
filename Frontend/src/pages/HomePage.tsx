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
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadTasksForUser = (activeUser: User | null) => {
    if (!activeUser) {
      setTasks([]);
      return;
    }

    const storedTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    setTasks(storedTasks.filter((task) => task.userId === activeUser.id));
  };

  const emitTaskUpdate = () => {
    window.dispatchEvent(new Event('task-tracker-updated'));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);
    loadTasksForUser(parsedUser);

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'task-tracker-tasks' || event.key === 'task-tracker-user') {
        loadTasksForUser(parsedUser);
      }
    };

    const handleTaskUpdate = () => {
      loadTasksForUser(parsedUser);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('task-tracker-updated', handleTaskUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('task-tracker-updated', handleTaskUpdate);
    };
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const addTask = () => {
    if (!user || !title.trim()) return;

    const newTask: TaskItem = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      userId: user.id
    };

    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    const updatedTasks = [...allTasks, newTask];
    localStorage.setItem('task-tracker-tasks', JSON.stringify(updatedTasks));
    setTasks((currentTasks) => [...currentTasks, newTask]);
    setTitle('');
    setDescription('');
    emitTaskUpdate();
  };

  const toggleTask = (taskId: number) => {
    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    const mergedTasks = allTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
    localStorage.setItem('task-tracker-tasks', JSON.stringify(mergedTasks));
    setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
    emitTaskUpdate();
  };

  const logout = () => {
    localStorage.removeItem('task-tracker-user');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login', { replace: true });
  };

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = filterStatus === 'all'
        ? true
        : filterStatus === 'completed'
          ? task.completed
          : !task.completed;
      const matchesSearch = !normalizedSearch
        || task.title.toLowerCase().includes(normalizedSearch)
        || task.description.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchTerm, tasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const visibleTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

        <div className="filter-bar">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}>
            <option value="all">All tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks" />
        </div>

        <div className="pagination-row">
          <button type="button" className="pagination-btn" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="pagination-btn" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>

        <div className="task-list">
          {visibleTasks.length === 0 ? <p>No tasks match the current filter.</p> : visibleTasks.map((task) => (
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
