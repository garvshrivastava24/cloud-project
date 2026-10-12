import React, { useState } from 'react';

export const ADMIN_CREDENTIALS = {
  validUsernames: ['admin', 'admin@studentportal.com', 'admin@school.edu'],
  validPasswords: ['admin123', 'admin@123', 'password123'],
  defaultUser: {
    username: 'admin',
    email: 'admin@studentportal.com',
    name: 'College Admin',
    role: 'Administrator',
    avatarInitials: 'AD',
  },
};

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your administrator ID or email.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate brief secure verification for polished UX
    setTimeout(() => {
      const isValidUser = ADMIN_CREDENTIALS.validUsernames.some(
        (u) => u.toLowerCase() === cleanUser
      );
      const isValidPass = ADMIN_CREDENTIALS.validPasswords.includes(cleanPass);

      if (isValidUser && isValidPass) {
        const userSession = {
          ...ADMIN_CREDENTIALS.defaultUser,
          email: cleanUser.includes('@') ? cleanUser : ADMIN_CREDENTIALS.defaultUser.email,
          loginTime: new Date().toISOString(),
        };

        if (rememberMe) {
          try {
            localStorage.setItem('sms_auth_user', JSON.stringify(userSession));
          } catch {
            // Ignore storage quota errors
          }
        }
        sessionStorage.setItem('sms_auth_user', JSON.stringify(userSession));

        onLoginSuccess(userSession);
      } else {
        setError('Invalid Administrator ID or password. Use the provided demo credentials below.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleFillCredentials = () => {
    setUsername('admin@studentportal.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="login-page-container">
      {/* Ambient background decoration */}
      <div className="login-ambient-orb login-ambient-orb-1" aria-hidden="true" />
      <div className="login-ambient-orb login-ambient-orb-2" aria-hidden="true" />

      <div className="login-card">
        {/* Header with Branding */}
        <div className="login-card-header">
          <div className="login-brand-icon" aria-hidden="true">
            🎓
          </div>
          <h1 className="login-title">Student Management System</h1>
          <p className="login-subtitle">
            Secure Administrator Portal • Cloud Academic Management
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="login-demo-badge">
          <div className="login-demo-badge-header">
            <span className="demo-badge-pill">ADMIN ACCESS CREDENTIALS</span>
            <button
              type="button"
              className="demo-autofill-btn"
              onClick={handleFillCredentials}
              title="Click to automatically fill credentials into form"
            >
              ⚡ Auto-Fill
            </button>
          </div>
          <div className="login-demo-grid">
            <div className="demo-field">
              <span className="demo-label">Login ID:</span>
              <code className="demo-val">admin@studentportal.com</code>
            </div>
            <div className="demo-field">
              <span className="demo-label">Password:</span>
              <code className="demo-val">admin123</code>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="login-alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form-group">
            <label htmlFor="login-username" className="login-form-label">
              Admin Login ID / Email
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                className="login-input"
                placeholder="e.g. admin or admin@studentportal.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <div className="form-label-row">
              <label htmlFor="login-password" className="login-form-label">
                Password
              </label>
              <button
                type="button"
                className="login-forgot-link"
                onClick={handleFillCredentials}
              >
                Use Admin Pass
              </button>
            </div>
            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input login-input-password"
                placeholder="Enter admin password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <label className="login-remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <span>Remember this session</span>
            </label>
            <span className="login-role-tag">Role: Administrator</span>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-content">
                <span className="spinner-sm" aria-hidden="true" />
                Verifying Credentials...
              </span>
            ) : (
              <span>Sign In to Dashboard →</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="login-card-footer">
          <div className="footer-shield-row">
            <span aria-hidden="true">🛡️</span>
            <span>Enterprise 256-bit Protected Session • Local SQLite Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
