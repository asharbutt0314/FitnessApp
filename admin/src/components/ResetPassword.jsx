import { useState } from 'react'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setMessage('Password reset link sent to your email!')
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(15, 23, 42, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div className="text-center mb-4">
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 25px rgba(15, 23, 42, 0.3)'
          }}>
            <i className="bi bi-key-fill text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 style={{ color: '#6b7280', fontWeight: 'bold' }}>Reset Password</h2>
          <p style={{ color: '#9ca3af' }}>Enter your email to reset password</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'rgba(15, 23, 42, 0.95)', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(15, 23, 42, 0.2)',
                padding: '12px 16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <button
            type="submit"
            className="btn w-100 mb-3"
            disabled={loading}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          {message && (
            <div className="alert alert-success text-center" style={{ borderRadius: '12px' }}>
              {message}
            </div>
          )}
        </form>
        
        <div className="text-center mt-3">
          <a href="/login" style={{ color: 'rgba(15, 23, 42, 0.95)', textDecoration: 'none', fontWeight: 'bold' }}>Back to Login</a>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword