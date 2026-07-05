import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type TaskItem = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  userId: number;
};

function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];
    const foundTask = allTasks.find((item) => item.id === Number(id) && item.userId === user.id);
    if (foundTask) {
      setTitle(foundTask.title);
      setDescription(foundTask.description);
      setCompleted(foundTask.completed);
    }
  }, [id, navigate]);

  const handleSubmit = () => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    const allTasks = JSON.parse(localStorage.getItem('task-tracker-tasks') || '[]') as TaskItem[];

    if (isEdit) {
      const updatedTasks = allTasks.map((task) => (task.id === Number(id) && task.userId === user.id ? { ...task, title, description, completed } : task));
      localStorage.setItem('task-tracker-tasks', JSON.stringify(updatedTasks));
    } else {
      const newTask: TaskItem = {
        id: Date.now(),
        title,
        description,
        completed: false,
        userId: user.id
      };
      localStorage.setItem('task-tracker-tasks', JSON.stringify([...allTasks, newTask]));
    }

    navigate('/');
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h2>{isEdit ? 'Edit Task' : 'Create Task'}</h2>
            <p>{isEdit ? 'Update the selected task' : 'Add a new task for your list'}</p>
          </div>
          <Link to="/" className="link-btn">Back</Link>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={5} />
        {isEdit ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
            Mark as completed
          </label>
        ) : null}
        <button onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Create Task'}</button>
      </div>
    </div>
  );
}

export default TaskFormPage;
