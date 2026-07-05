import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5074';

type LoginForm = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const storedUsers = JSON.parse(localStorage.getItem('task-tracker-users') || '[]') as Array<{ email: string; password: string; name: string; id: number; role?: string }>;
      const localUser = storedUsers.find((item) => item.email.toLowerCase() === form.email.toLowerCase() && item.password === form.password);

      if (localUser) {
        localStorage.setItem('task-tracker-user', JSON.stringify(localUser));
        window.dispatchEvent(new Event('auth-changed'));
        setSuccess('Login successful. Redirecting...');
        setTimeout(() => navigate('/'), 500);
        return;
      }

      const loginResponse = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password
        })
      });

      if (!loginResponse.ok) {
        setError('Invalid email or password.');
        return;
      }

      const backendUser = await loginResponse.json() as { id: number; name: string; email: string; role: string };
      const authenticatedUser = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        password: form.password,
        role: backendUser.role
      };

      localStorage.setItem('task-tracker-user', JSON.stringify(authenticatedUser));
      window.dispatchEvent(new Event('auth-changed'));
      setSuccess('Login successful. Redirecting...');
      setTimeout(() => navigate('/'), 500);
    } catch {
      setError('Unable to sign in right now.');
    }
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
