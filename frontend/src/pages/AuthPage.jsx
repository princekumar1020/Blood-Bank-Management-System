import React, { useState } from 'react'

const initialLogin = { email: '', password: '' }
const initialSignup = { name: '', email: '', password: '', confirmPassword: '' }

export default function AuthPage({ onNavigate }) {
  const [mode, setMode] = useState('login')
  const [login, setLogin] = useState(initialLogin)
  const [signup, setSignup] = useState(initialSignup)
  const [error, setError] = useState('')

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLogin((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (event) => {
    const { name, value } = event.target
    setSignup((prev) => ({ ...prev, [name]: value }))
  }

  const validateSignup = () => {
    if (!signup.name.trim() || !signup.email.trim() || !signup.password.trim()) {
      return 'Please fill in all fields.'
    }
    if (signup.password !== signup.confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (mode === 'login') {
      if (!login.email.trim() || !login.password.trim()) {
        setError('Please enter email and password.')
        return
      }
      // TODO: Replace with API call
      alert(`Logging in as ${login.email}`)
      onNavigate('dashboard')
    } else {
      const validationError = validateSignup()
      if (validationError) {
        setError(validationError)
        return
      }
      // TODO: Replace with API call
      alert(`Creating account for ${signup.name} (${signup.email})`)
      onNavigate('dashboard')
    }
  }

  return (
    <main className="page auth-page">
      <div className="auth-card">
        <h1>{mode === 'login' ? 'Log in' : 'Sign up'}</h1>
        <p className="subtitle">
          {mode === 'login'
            ? 'Access your Blood Bank account & see donation requests.'
            : 'Create an account to donate blood or request it for someone in need.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label className="form-group">
              <span>Name</span>
              <input
                name="name"
                type="text"
                value={signup.name}
                onChange={handleSignupChange}
                placeholder="Your full name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="form-group">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={mode === 'login' ? login.email : signup.email}
              onChange={mode === 'login' ? handleLoginChange : handleSignupChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="form-group">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={mode === 'login' ? login.password : signup.password}
              onChange={mode === 'login' ? handleLoginChange : handleSignupChange}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {mode === 'signup' && (
            <label className="form-group">
              <span>Confirm Password</span>
              <input
                name="confirmPassword"
                type="password"
                value={signup.confirmPassword}
                onChange={handleSignupChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          )}

          {!!error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary"> 
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="switch">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button type="button" className="link" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="link" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          )}
        </p>

        <button type="button" className="link" onClick={() => onNavigate('home')}>
          Back to Home
        </button>
      </div>
    </main>
  )
}
