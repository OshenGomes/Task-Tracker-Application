import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type LoginForm = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const storedUsers = JSON.parse(localStorage.getItem('task-tracker-users') || '[]') as Array<{ email: string; password: string; name: string; id: number }>;
    const user = storedUsers.find((item) => item.email.toLowerCase() === form.email.toLowerCase() && item.password === form.password);

    if (!user) {
      setError('Invalid email or password.');
      return;
    }

    localStorage.setItem('task-tracker-user', JSON.stringify(user));
    setSuccess('Login successful. Redirecting...');
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p>Sign in to see your tasks</p>
        {error ? <div className="error">{error}</div> : null}
        {success ? <div className="success">{success}</div> : null}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
        <p>
          No account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
