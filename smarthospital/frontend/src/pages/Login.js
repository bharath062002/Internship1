import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.username, form.password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DOCTOR') navigate('/doctor/appointments');
      else navigate('/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (username, password) => {
    setForm({ username, password });
  };

  return (
    <div className="auth-page">
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-container fade-in">
        <div className="auth-brand">
          <span className="auth-brand-icon">⊕</span>
          <span>SmartHospital</span>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} /> : null}
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>Quick Demo Login</span></div>

          <div className="demo-btns">
            <button className="demo-btn" onClick={() => quickLogin('admin', 'admin123')}>
              <span className="demo-icon">⬡</span>
              <div>
                <div className="demo-role">Admin</div>
                <div className="demo-cred">admin / admin123</div>
              </div>
            </button>
            <button className="demo-btn" onClick={() => quickLogin('dr.sharma', 'doctor123')}>
              <span className="demo-icon">🩺</span>
              <div>
                <div className="demo-role">Doctor</div>
                <div className="demo-cred">dr.sharma / doctor123</div>
              </div>
            </button>
            <button className="demo-btn" onClick={() => quickLogin('patient1', 'patient123')}>
              <span className="demo-icon">👤</span>
              <div>
                <div className="demo-role">Patient</div>
                <div className="demo-cred">patient1 / patient123</div>
              </div>
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
