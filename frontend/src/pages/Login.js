import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [registerMode, setRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (registerMode) {
        await axios.post('/api/auth/register', form);
        setError('');
        alert('Registered successfully, please log in');
        setRegisterMode(false);
        setForm({ name: '', email: '', password: '' });
      } else {
        await login(form.email, form.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setRegisterMode(!registerMode);
    setForm({ name: '', email: '', password: '' });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <div className="login-content">
        <div className="login-card">
          {/* Header Section */}
          <div className="login-header">
            <h1 className="login-title">{registerMode ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="login-subtitle">
              {registerMode ? 'Join us today and get started' : 'Sign in to your account'}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={onSubmit} className="login-form">
            {/* Error Alert */}
            {error && (
              <div className="alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Name Field (Register Mode) */}
            {registerMode && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <span className="label-text">Full Name</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={onChange}
                    required={registerMode}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <span className="label-text">Email Address</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span className="label-text">Password</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {registerMode ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                registerMode ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Mode Section */}
          <div className="toggle-section">
            <p className="toggle-text">
              {registerMode ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              type="button"
              className="toggle-btn"
              onClick={toggleMode}
            >
              {registerMode ? 'Sign In' : 'Create One'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
