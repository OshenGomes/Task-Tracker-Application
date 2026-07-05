import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type SignupForm = {
  name: string;
  email: string;
  password: string;
};

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('task-tracker-users') || '[]') as Array<{ email: string; password: string; name: string; id: number }>;
    const existing = storedUsers.find((user) => user.email.toLowerCase() === form.email.toLowerCase());

    if (existing) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = { id: Date.now(), name: form.name.trim(), email: form.email.trim(), password: form.password };
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem('task-tracker-users', JSON.stringify(updatedUsers));
    localStorage.setItem('task-tracker-user', JSON.stringify(newUser));
    window.dispatchEvent(new Event('auth-changed'));
    setSuccess('Account created successfully. Redirecting...');
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <p>Create your account to manage tasks</p>
        {error ? <div className="error">{error}</div> : null}
        {success ? <div className="success">{success}</div> : null}
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
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
        <button type="submit">Create Account</button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
