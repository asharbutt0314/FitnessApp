import { useState, useEffect } from 'react'
import api from '../config/api'

function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({})

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/trainers')
      if (response.data.success) {
        setTrainers(response.data.trainers)
      }
    } catch (error) {
      console.error('Error fetching trainers:', error)
      alert('Failed to fetch trainers')
    } finally {
      setLoading(false)
    }
  }

  const editTrainer = (trainer) => {
    setEditingTrainer(trainer._id)
    setEditForm({ ...trainer })
  }

  const saveTrainer = async () => {
    try {
      const response = await api.put(`/api/admin/trainers/${editingTrainer}`, editForm)
      if (response.data.success) {
        await fetchTrainers()
        setEditingTrainer(null)
        setEditForm({})
        alert('Trainer updated successfully')
      }
    } catch (error) {
      console.error('Error updating trainer:', error)
      alert('Failed to update trainer')
    }
  }

  const deleteTrainer = async (trainerId) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        const response = await api.delete(`/api/admin/trainers/${trainerId}`)
        if (response.data.success) {
          await fetchTrainers()
          alert('Trainer deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting trainer:', error)
        alert('Failed to delete trainer')
      }
    }
  }

  const toggleTrainerStatus = async (trainerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
      const response = await api.put(`/api/admin/trainers/${trainerId}`, { status: newStatus })
      if (response.data.success) {
        await fetchTrainers()
        alert(`Trainer status changed to ${newStatus}`)
      }
    } catch (error) {
      console.error('Error updating trainer status:', error)
      alert('Failed to update trainer status')
    }
  }

  const filteredTrainers = trainers.filter(trainer => 
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="bi bi-person-badge-fill"></i>
          </div>
          <h1>Trainers Management</h1>
          <p>Manage fitness trainers and their specializations</p>
          <div className="alert alert-info mt-3" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '15px 20px',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            <i className="bi bi-info-circle me-2"></i>
            We will add this feature in future
          </div>
        </div>
      </div>

      {/* <div className="admin-actions mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>All Trainers ({loading ? '...' : trainers.length})</h3>
          <div className="d-flex gap-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search trainers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
            <button 
              className="btn" 
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                padding: '12px 24px',
                boxShadow: '0 4px 14px 0 rgba(15, 23, 42, 0.39)'
              }}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Trainer
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Trainer</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTrainers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No trainers found
                  </td>
                </tr>
              ) : filteredTrainers.map((trainer) => (
                <tr key={trainer._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-3">
                        {trainer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="fw-semibold">{trainer.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{trainer.email}</td>
                  <td>
                    <span className="badge bg-info">{trainer.specialization}</span>
                  </td>
                  <td className="text-muted">{trainer.experience}</td>
                  <td>
                    <button
                      className={`badge ${trainer.status === 'Active' ? 'bg-success' : 'bg-warning'}`}
                      onClick={() => toggleTrainerStatus(trainer._id, trainer.status)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 12px'
                      }}
                    >
                      {trainer.status}
                    </button>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm"
                        onClick={() => toggleTrainerStatus(trainer._id, trainer.status)}
                        title={`Make ${trainer.status === 'Active' ? 'Inactive' : 'Active'}`}
                        style={{
                          background: trainer.status === 'Active' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                        <i className={`bi ${trainer.status === 'Active' ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                      </button>
                      <button 
                        className="btn btn-sm"
                        onClick={() => editTrainer(trainer)}
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
                        onClick={() => deleteTrainer(trainer._id)}
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

      {editingTrainer && (
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
              borderBottom: 'none'
            }}>
              <h5 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'white'}}>Edit Trainer</h5>
              <button 
                className="btn-close"
                onClick={() => setEditingTrainer(null)}
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
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Specialization</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editForm.specialization || ''}
                  onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Experience</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editForm.experience || ''}
                  onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
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
                onClick={() => setEditingTrainer(null)}
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
                onClick={saveTrainer}
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

      {showAddForm && (
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
              borderBottom: 'none'
            }}>
              <h5 style={{margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'white'}}>Add New Trainer</h5>
              <button 
                className="btn-close"
                onClick={() => setShowAddForm(false)}
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
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={addForm.name || ''}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  placeholder="Enter trainer name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={addForm.email || ''}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Specialization</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={addForm.specialization || ''}
                  onChange={(e) => setAddForm({...addForm, specialization: e.target.value})}
                  placeholder="e.g., Strength Training, Yoga"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Experience</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={addForm.experience || ''}
                  onChange={(e) => setAddForm({...addForm, experience: e.target.value})}
                  placeholder="e.g., 5 years"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select 
                  className="form-control" 
                  value={addForm.status || 'Active'}
                  onChange={(e) => setAddForm({...addForm, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                onClick={() => setShowAddForm(false)}
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
                onClick={async () => {
                  try {
                    const response = await api.post('/api/admin/trainers', addForm)
                    if (response.data.success) {
                      await fetchTrainers()
                      setShowAddForm(false)
                      setAddForm({})
                      alert('Trainer added successfully')
                    }
                  } catch (error) {
                    console.error('Error adding trainer:', error)
                    alert('Failed to add trainer')
                  }
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: '600'
                }}
              >
                Add Trainer
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default Trainers