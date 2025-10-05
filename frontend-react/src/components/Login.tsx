import { useState } from 'react';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

const API_URL = 'http://localhost:8000';

export function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Authentication failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_email', email);
      
      // Call success handler
      onLoginSuccess(data.access_token, email);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Continue without login
    onLoginSuccess('', '');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Chimera</h1>
        <p className="login-subtitle">AI-Powered Research Assistant</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-tabs">
            <button
              type="button"
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@nasa.gov"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>

          <button type="button" className="skip-button" onClick={handleSkip}>
            Continue without login
          </button>
        </form>

        <div className="login-info">
          <p>With an account, your preferences and chat history will be automatically saved</p>
          <p>The system learns your preferred persona and favorite topics over time</p>
        </div>
      </div>
    </div>
  );
}
