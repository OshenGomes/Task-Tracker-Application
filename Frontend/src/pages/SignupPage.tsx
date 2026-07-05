import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5074';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: 'user'
        })
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || 'Unable to create account.');
        return;
      }

      const createdUser = await response.json() as { id: number; name: string; email: string; role: string };
      const authenticatedUser = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        password: form.password,
        role: createdUser.role
      };

      localStorage.setItem('task-tracker-user', JSON.stringify(authenticatedUser));
      window.dispatchEvent(new Event('auth-changed'));
      setSuccess('Account created successfully. Redirecting...');
      setTimeout(() => navigate('/'), 500);
    } catch {
      setError('Unable to create account right now.');
    }
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
