import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sprout, Activity, ShieldCheck, Leaf, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register, currentUser } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isLoginMode) {
        const result = login(username, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error);
        }
      } else {
        const result = register(username, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error);
        }
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="landing-layout">
      {/* Animated Background Overlay */}
      <div className="animated-bg">
        <div className="gradient-sphere shape-1"></div>
        <div className="gradient-sphere shape-2"></div>
        <div className="gradient-sphere shape-3"></div>
      </div>
      
      <div className="landing-container">
        {/* Left Side: Project Info */}
        <motion.div 
          className="project-info-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="info-content">
            <div className="brand">
              <Sprout size={48} className="brand-icon" />
              <h1 className="brand-title">AgriVision</h1>
            </div>
            
            <h2 className="info-headline">Empowering Farmers with AI.</h2>
            <p className="info-description">
              Crop diseases can devastate yields and threaten food security. AgriVision uses advanced Vision Transformers to detect wheat diseases instantly from a single smartphone photo, providing actionable insights right when you need them.
            </p>
            
            <div className="features-grid">
              <div className="feature-card glass-panel">
                <Activity size={24} className="feature-icon text-blue" />
                <div>
                  <h3>Instant Analysis</h3>
                  <p>Accurate disease predictions in seconds without leaving the field.</p>
                </div>
              </div>
              <div className="feature-card glass-panel">
                <ShieldCheck size={24} className="feature-icon text-green" />
                <div>
                  <h3>Treatment Plans</h3>
                  <p>Receive actionable maintenance advice tailored to the specific condition.</p>
                </div>
              </div>
              <div className="feature-card glass-panel">
                <Leaf size={24} className="feature-icon text-yellow" />
                <div>
                  <h3>Historical Tracking</h3>
                  <p>Keep a detailed log of past scans to monitor crop health over time.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div 
          className="login-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="login-card glass-container-strong">
            <div className="login-header">
              <h2 className="login-title">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="login-subtitle">
                {isLoginMode ? 'Sign in to your account to continue' : 'Sign up to start tracking your crops'}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="auth-error"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLoginMode ? "Enter your password" : "Create a password"}
                    className={error ? 'input-error' : ''}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {isLoginMode && (
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#" className="forgot-password">Forgot Password?</a>
                </div>
              )}
              
              <motion.button 
                type="submit" 
                className={`btn-primary login-btn ${isAuthenticating ? 'loading' : ''}`}
                disabled={isAuthenticating}
                whileHover={isAuthenticating ? {} : { scale: 1.02 }}
                whileTap={isAuthenticating ? {} : { scale: 0.98 }}
              >
                {isAuthenticating ? (
                  <div className="btn-content">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  isLoginMode ? 'Sign In to Dashboard' : 'Create Account'
                )}
              </motion.button>
            </form>
            
            <p className="login-footer">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <span onClick={toggleMode} style={{ cursor: 'pointer' }}>
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
