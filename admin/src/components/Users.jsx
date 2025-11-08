import { useState, useEffect } from 'react'
import api from '../config/api'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/users')
      if (response.data.success) {
        setUsers(response.data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const editUser = (user) => {
    setEditingUser(user._id)
    setEditForm({ username: user.username, email: user.email })
  }

  const saveUser = async () => {
    try {
      const response = await api.put(`/api/admin/users/${editingUser}`, editForm)
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === editingUser 
            ? { ...user, ...editForm }
            : user
        ))
        setEditingUser(null)
        setEditForm({})
        alert('User updated successfully')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await api.delete(`/api/admin/users/${userId}`)
        if (response.data.success) {
          await fetchUsers()
          alert('User deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const toggleUserVerification = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      const response = await api.put(`/api/admin/users/${userId}`, { isVerified: newStatus })
      if (response.data.success) {
        await fetchUsers()
        alert(`User ${newStatus ? 'verified' : 'unverified'} successfully`)
      }
    } catch (error) {
      console.error('Error updating user verification:', error)
      alert('Failed to update user verification')
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <h1>Users Management</h1>
          <p>Monitor and manage platform users</p>
        </div>
      </div>

      <div className="admin-actions mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>All Users ({loading ? '...' : users.length})</h3>
          <div className="d-flex gap-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No users found
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-3">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="fw-semibold">{user.username}</span>
                    </div>
                  </td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <button
                      className={`badge ${user.isVerified ? 'bg-success' : 'bg-warning'}`}
                      onClick={() => toggleUserVerification(user._id, user.isVerified)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 12px'
                      }}
                    >
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </button>
                  </td>
                  <td className="text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm"
                        onClick={() => toggleUserVerification(user._id, user.isVerified)}
                        title={`Make ${user.isVerified ? 'Pending' : 'Verified'}`}
                        style={{
                          background: user.isVerified ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <i className={`bi ${user.isVerified ? 'bi-x-circle-fill' : 'bi-check-circle-fill'}`}></i>
                      </button>
                      <button 
                        className="btn btn-sm"
                        onClick={() => editUser(user)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm"
                        onClick={() => deleteUser(user._id)}
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: 'none',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'rgba(15, 23, 42, 0.95)',
              color: 'white',
              padding: '1.5rem 2rem',
              borderBottom: '2px solid rgba(255, 107, 107, 0.3)'
            }}>
              <h5 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'white'}}>Edit User</h5>
              <button 
                className="btn-close"
                onClick={() => setEditingUser(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >×</button>
            </div>
            <div className="modal-body" style={{
              padding: '2rem',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={editForm.email || ''}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editForm.username || ''}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter new password (leave blank to keep current)"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer" style={{
              padding: '1.5rem 2rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                className="btn"
                onClick={() => setEditingUser(null)}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button 
                className="btn"
                onClick={saveUser}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users