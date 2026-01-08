import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  GamepadIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon,
  AlertIcon, CloudIcon, SparklesIcon, PlayIcon
} from '../components/Icons';
import type React from 'react';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginUser } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result.success) {
        navigate('/launcher');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'demo@monogames.com', password: 'demo1234' });
  };

  return (
    <div className="login-page">
      <div className="login-container cartoony-container">
        {/* Decorative SVG elements */}
        <div className="doodle-star doodle-1">
          <SparklesIcon size={48} color="#FFD700" />
        </div>
        <div className="doodle-star doodle-2">
          <SparklesIcon size={40} color="#FFA500" />
        </div>
        <div className="doodle-cloud cloud-1">
          <CloudIcon size={64} color="#87CEEB" />
        </div>
        <div className="doodle-cloud cloud-2">
          <CloudIcon size={56} color="#B8E4F9" />
        </div>

        <div className="login-box cartoony-card">
          {/* Logo/Title */}
          <div className="login-header">
            <h1 className="cartoony-title" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <GamepadIcon size={48} color="var(--primary)" /> Mono Games
            </h1>
            <div className="cartoony-divider"></div>
            <p className="cartoony-subtitle">Welcome Back, Player!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-bubble cartoony-badge" style={{ backgroundColor: '#FF6B6B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertIcon size={20} color="white" /> {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="cartoony-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <EmailIcon size={20} color="var(--primary)" /> Email
              </label>
              <input
                type="email"
                className="cartoony-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="cartoony-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LockIcon size={20} color="var(--primary)" /> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="cartoony-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle cartoony-btn-small"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="cartoony-btn cartoony-btn-primary"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
              >
                {loading ? '⏳ Logging in...' : (
                  <>
                    <PlayIcon size={20} color="white" /> Let's Play!
                  </>
                )}
              </button>

              <button
                type="button"
                className="cartoony-btn cartoony-btn-secondary"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                🎭 Try Demo Account
              </button>
            </div>
          </form>

          {/* Divider */}
          {/* Divider */}
          <div className="login-divider">
            <span className="cartoony-text">or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login">
            <button className="social-btn google-btn cartoony-btn">
              <span className="social-icon">🔴</span> Google
            </button>
            <button className="social-btn github-btn cartoony-btn">
              <span className="social-icon">⚫</span> GitHub
            </button>
            <button className="social-btn discord-btn cartoony-btn">
              <span className="social-icon">🔵</span> Discord
            </button>
          </div>

          {/* Footer Links */}
          <div className="login-footer">
            <Link to="/forgot-password" className="cartoony-link">
              Forgot Password?
            </Link>
            <span className="separator">•</span>
            <Link to="/register" className="cartoony-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <SparklesIcon size={16} /> Create Account
            </Link>
          </div>

          {/* Guest Option */}
          <div className="guest-option">
            <button
              className="cartoony-btn cartoony-btn-ghost"
              onClick={() => navigate('/launcher')}
            >
              👻 Continue as Guest
            </button>
          </div>
        </div>

        {/* Fun fact bubble */}
        <div className="fun-fact-bubble cartoony-speech-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CloudIcon size={24} color="var(--accent)" />
          <div>
            <strong>Did you know?</strong> Registered players get cloud saves and achievements!
          </div>
        </div>

        {/* Fun fact bubble */}
        <div className="fun-fact-bubble cartoony-speech-bubble">
          💡 <strong>Did you know?</strong> Registered players get cloud saves and achievements!
        </div>
      </div>
    </div>
  );
};

export default Login;
