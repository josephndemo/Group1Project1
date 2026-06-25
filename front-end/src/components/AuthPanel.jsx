import React, { useState } from 'react';
import { authApi } from '../api/client.js';

export default function AuthPanel({ onAuthSuccess }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const payload = mode === 'login'
                ? { identifier: form.username || form.email, password: form.password }
                : { username: form.username, email: form.email, password: form.password };

            const result = mode === 'login'
                ? await authApi.login(payload)
                : await authApi.register(payload);

            if (mode === 'login') {
                localStorage.setItem('library_token', result.access_token);
                localStorage.setItem('library_user', JSON.stringify(result.user));
                onAuthSuccess?.(result.user);
                setMessage('Signed in successfully');
            } else {
                setMessage('Account created. Please sign in.');
                setMode('login');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: '2rem auto', padding: '1.5rem', border: '1px solid #ddd', borderRadius: 12 }}>
            <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
            <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                    <>
                        <label>Username</label>
                        <input name="username" value={form.username} onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }} />
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }} />
                    </>
                )}

                {mode === 'login' && (
                    <>
                        <label>Username or email</label>
                        <input name="username" value={form.username} onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }} />
                    </>
                )}

                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }} />

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem' }}>
                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
                </button>
            </form>

            <p style={{ marginTop: '1rem' }}>
                {mode === 'login' ? 'Need an account?' : 'Already have one?'}{' '}
                <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                </button>
            </p>

            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
