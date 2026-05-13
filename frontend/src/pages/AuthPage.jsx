import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialLogin = { email: '', password: '', userType: 'donor' }
const initialSignup = { name: '', email: '', password: '', confirmPassword: '', userType: 'donor', bloodGroup: '', phoneNumber: '', age: '' }

const RoleSwitcher = ({ userType, onSwitch }) => (
  <div className="role-switch-container">
    <div className={`role-switch-slider ${userType}`}></div>
    <button
      type="button"
      className={userType === 'donor' ? 'active' : ''}
      onClick={() => onSwitch('donor')}
    >
      Donor
    </button>
    <button
      type="button"
      className={userType === 'recipient' ? 'active' : ''}
      onClick={() => onSwitch('recipient')}
    >
      Recipient
    </button>
  </div>
);

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState(initialLogin)
  const [error, setError] = useState('')
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setError('');
    setFormData(mode === 'login' ? initialLogin : initialSignup);
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleSwitch = (newUserType) => {
    setFormData((prev) => ({ ...prev, userType: newUserType }));
  }

  const validateSignup = () => {
    const { name, email, password, confirmPassword, userType, bloodGroup, phoneNumber, age } = formData;
    if (!name.trim() || !email.trim() || !password.trim() || !userType || !bloodGroup || !phoneNumber.trim() || !age.trim()) {
      return 'Please fill in all fields.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'login') {
      const { email, password, userType } = formData;
      if (!email.trim() || !password.trim()) {
        setError('Please enter email and password.')
        return
      }
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password, userType });
        console.log('Login successful:', response.data);
        login(response.data);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Login error:', err); // Add this for better debugging
        if (!err.response) {
          setError('Network error: Cannot connect to the backend server. Is it running?');
        } else {
          setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
      }
    } else {
      const validationError = validateSignup();
      if (validationError) {
        setError(validationError);
        return;
      }
      try {
        // The password confirmation is only for the frontend, so we can remove it.
        const { confirmPassword, name, userType, phoneNumber, ...rest } = formData;
        const signupData = {
          ...rest,
          fullName: name,
          role: userType,
          mobileNo: phoneNumber,
          gender: 'Other' // Since frontend doesn't have a gender field
        };
        const response = await axios.post(`${API_URL}/api/auth/signup`, signupData);
        console.log('Signup successful:', response.data);
        login(response.data); // Automatically log in the user after signup
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Signup error:', err); // Add this for better debugging
        if (!err.response) {
          setError('Network error: Cannot connect to the backend server. Is it running?');
        } else {
          setError(err.response?.data?.message || 'Signup failed. Please try again.');
        }
      }
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
          {mode === 'login' && (
            <div className="form-group">
              <span>I am a</span>
              <RoleSwitcher userType={formData.userType} onSwitch={handleRoleSwitch} />
            </div>
          )}
          {mode === 'signup' && (
            <>
              <label className="form-group">
                <span>Name</span>
                <input
                  name="name"
                  type="text"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>
              <div className="form-row">
                <div className="form-group">
                  <span>I am a</span>
                  <RoleSwitcher userType={formData.userType} onSwitch={handleRoleSwitch} />
                </div>
                <label className="form-group">
                  <span>Blood Group</span>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="" disabled>-- Select Blood Group --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label className="form-group phone-group">
                  <span>Phone Number</span>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    autoComplete="tel"
                  />
                </label>
                <label className="form-group age-group">
                  <span>Age</span>
                  <input
                    name="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={handleChange}
                    placeholder="Your age"
                    autoComplete="off"
                  />
                </label>
              </div>
            </>
          )}

          <label className="form-group">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="form-group">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={handleChange}
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
                value={formData.confirmPassword || ''}
                onChange={handleChange}
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

        <button type="button" className="link" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </main>
  )
}
