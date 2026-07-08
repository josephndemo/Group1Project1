import { useEffect, useState } from 'react';
import { showAppAlert, showError, showSuccess } from '../utils/swal.js';
import { usersApi } from '../api/client.js';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await usersApi.list();
        setUsers(data || []);
      } catch (err) {
        setError(err.message || 'Could not load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const updatedUser = await usersApi.update(userId, { role });
      setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
      showSuccess('User updated', 'Account role was updated successfully.');
    } catch (err) {
      showError('Role update failed', err.message || 'Could not update account role.');
    }
  };

  const handleDelete = async (userId, username) => {
    const result = await showAppAlert({
      icon: 'warning',
      title: 'Delete account?',
      text: `This will permanently delete ${username}'s account and related data.`,
      showCancelButton: true,
      confirmButtonText: 'Delete account',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await usersApi.remove(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      showSuccess('User deleted', 'Account was removed successfully.');
    } catch (err) {
      showError('Delete failed', err.message || 'Could not delete account.');
    }
  };

  if (loading) {
    return (
      <div className="empty-view-state">
        <h2>Loading users...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-view-state">
        <h2>Could not load users</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="manage-books-layout">
      <div className="manage-books-library-column">
        <div className="manage-books-section-header">
          <div>
            <p className="manage-books-kicker">Administration</p>
            <h3>Manage user accounts</h3>
          </div>
          <span className="manage-books-pill">{users.length} users</span>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map((user) => (
            <article
              key={user.id}
              style={{
                display: 'grid',
                gap: '0.75rem',
                padding: '1rem',
                border: '1px solid rgba(15, 23, 42, 0.12)',
                borderRadius: '1rem',
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{user.username}</h4>
                  <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>{user.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: '#475569' }}>Shelves: {user.shelf_count}</span>
                  <span style={{ color: '#475569' }}>Favorites: {user.favorite_count}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 600 }} htmlFor={`role-${user.id}`}>Role</label>
                <select
                  id={`role-${user.id}`}
                  value={user.role}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  type="button"
                  className="manage-book-cancel-btn"
                  onClick={() => handleDelete(user.id, user.username)}
                >
                  Delete account
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}