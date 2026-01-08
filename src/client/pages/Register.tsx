import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { validatePassword, isValidEmail, isValidUsername } from '../utils/security';
import {
  GamepadIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon,
  AlertIcon, CloudIcon, SparklesIcon, PlayIcon, UserIcon, TrophyIcon, CheckIcon
} from '../components/Icons';
import type React from 'react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  isValid: boolean;
  strength: string;
  score: number;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    const validation = validatePassword(password);
    setPasswordStrength(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidUsername(formData.username)) {
      setError('Username must be 3-20 characters, letters, numbers and underscores only');
      return;
    }

    if (!passwordStrength?.isValid) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        setToken(response.data.data.token);
        navigate('/launcher');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return '#ccc';
    if (passwordStrength.strength < 30) return '#FF6B6B';
    if (passwordStrength.strength < 60) return '#FFB347';
    return '#51CF66';
  };

  const getStrengthText = () => {
    if (!passwordStrength) return '';
    if (passwordStrength.strength < 30) return 'Weak';
    if (passwordStrength.strength < 60) return 'Good';
    return 'Strong';
  };

  return (
    <div className="register-page">
      <div className="register-container cartoony-container">
        {/* Decorative SVG elements */}
        <div className="doodle-star doodle-1">
          <SparklesIcon size={48} color="#FFD700" />
        </div>
        <div className="doodle-star doodle-2">
          <SparklesIcon size={42} color="#FFA500" />
        </div>
        <div className="doodle-star doodle-3">
          <SparklesIcon size={38} color="#FF6B35" />
        </div>
        <div className="doodle-cloud cloud-1">
          <CloudIcon size={64} color="#87CEEB" />
        </div>
        <div className="doodle-cloud cloud-2">
          <CloudIcon size={56} color="#B8E4F9" />
        </div>
        <div className="floating-gamepad">
          <GamepadIcon size={64} color="var(--primary)" />
        </div>
        <div className="floating-trophy">
          <TrophyIcon size={64} color="#FFD700" />
        </div>

        <div className="register-box cartoony-card">
          {/* Header */}
          <div className="register-header">
            <h1 className="cartoony-title" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <SparklesIcon size={48} color="var(--primary)" /> Join Mono Games!
            </h1>
            <div className="cartoony-divider"></div>
            <p className="cartoony-subtitle">Create your account and start playing!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-bubble cartoony-badge" style={{ backgroundColor: '#FF6B6B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertIcon size={20} color="white" /> {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label className="cartoony-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={20} color="var(--primary)" /> Username
              </label>
              <input
                type="text"
                className="cartoony-input"
                placeholder="CoolGamer123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                maxLength={20}
              />
              <small className="form-hint">3-20 characters, letters, numbers, underscores</small>
            </div>

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
                  onChange={(e) => handlePasswordChange(e.target.value)}
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
              {passwordStrength && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="cartoony-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LockIcon size={20} color="var(--primary)" /> Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="cartoony-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                />
                <span className="cartoony-text">
                  I agree to the <Link to="/terms" className="cartoony-link">Terms of Service</Link> and <Link to="/privacy" className="cartoony-link">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="cartoony-btn cartoony-btn-primary"
                disabled={loading || !agreedToTerms}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
              >
                {loading ? '⏳ Creating Account...' : (
                  <>
                    <PlayIcon size={20} color="white" /> Create Account!
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="register-divider">
            <span className="cartoony-text">or sign up with</span>
          </div>

          {/* Social Signup Buttons */}
          <div className="social-signup">
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
          <div className="register-footer">
            <span className="cartoony-text">Already have an account?</span>
            <Link to="/login" className="cartoony-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <GamepadIcon size={16} /> Login Here
            </Link>
          </div>
        </div>

        {/* Benefits bubble */}
        <div className="benefits-bubble">
          <h4 className="cartoony-h4">Join Mono Games! 🎮</h4>
          <ul className="benefits-list">
            <li><CheckIcon size={16} /> Cloud Saves</li>
            <li><CheckIcon size={16} /> Achievements</li>
            <li><CheckIcon size={16} /> Leaderboards</li>
            <li><CheckIcon size={16} /> Friends System</li>
          </ul>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="doodle-star doodle-1">⭐</div>
      <div className="doodle-star doodle-2">✨</div>
      <div className="doodle-star doodle-3">💫</div>
      <div className="doodle-cloud cloud-1">☁️</div>
      <div className="doodle-cloud cloud-2">☁️</div>
      <div className="floating-trophy"><TrophyIcon size={64} /></div>
    </div>
  );
};

export default Register;
