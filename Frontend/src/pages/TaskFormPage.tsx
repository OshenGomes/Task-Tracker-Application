import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createTask, getTaskById, updateTask } from '../api/taskApi';

function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    void getTaskById(Number(id), user).then((foundTask) => {
      if (foundTask) {
        setTitle(foundTask.title);
        setDescription(foundTask.description);
        setCompleted(foundTask.completed);
      }
    });
  }, [id, navigate]);

  const handleSubmit = async () => {
    const storedUser = localStorage.getItem('task-tracker-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    try {
      if (isEdit) {
        const existing = await getTaskById(Number(id), user);
        if (!existing) {
          setError('Task not found.');
          return;
        }

        await updateTask({ ...existing, title, description, completed }, user);
      } else {
        await createTask({ title, description, completed }, user);
      }

      window.dispatchEvent(new Event('task-tracker-updated'));
      navigate('/');
    } catch {
      setError('Unable to save task on the server.');
    }
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
        {error ? <div className="error">{error}</div> : null}
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
