'use client';
import { useState } from 'react';

export default function CreateDoctorPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('doctor');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/admin/create-doctor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, full_name: fullName, role }) });
    if (res.ok) {
      const j = await res.json();
      setMsg(`Created user ${j.user.username} (${j.user.role})`);
      setUsername(''); setPassword(''); setFullName(''); setRole('doctor');
    } else {
      const j = await res.json();
      setMsg(j.message || 'Error');
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '32px auto' }}>
      <h1>Create doctor / user</h1>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="doctor">Doctor</option>
          <option value="secretary">Secretary</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create user</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
