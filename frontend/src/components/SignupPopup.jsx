import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import '../styles/SignupPopup.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { toast } from 'react-toastify';

const SignupPopup = ({ isOpen, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      return toast.error('Please enter a valid email');
    }

    try {
      const res = await fetch('/api/mail/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        toast.success('OTP sent to your email');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while sending OTP');
    }
  };

  const handleVerifyOtpAndSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }

    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/mail/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || 'OTP verification failed');

      // 2. Create user
      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || 'Signup failed');

      // 3. Login
      const loginResult = await login({ email: formData.email, password: formData.password });
      if (loginResult.success) {
        toast.success('Account created & logged in successfully!');
        navigate('/');
        onClose();
      } else {
        throw new Error(loginResult.message || 'Login failed after signup');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Signup process failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="signup-popup-container">
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="modal-header">
            <img
              src="https://www.vinsys.com/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
              alt="Vinsys Logo"
              style={{ width: '100px', height: '80px' }}
            />
            <h2 className="modal-title">Create Account</h2>
            <p className="modal-subtitle">Join us to start booking training rooms</p>
          </div>

          <div className="modal-body">
            <form onSubmit={handleVerifyOtpAndSignup}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input text-black"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input text-black"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* OTP & Passwords */}
              {!otpSent ? (
                <button type="button" className="signup-button text-black" onClick={handleSendOtp}>
                  Send OTP
                </button>
              ) : (
                <>
                  {/* OTP */}
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="form-input text-black"
                      placeholder="Enter OTP"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input text-black"
                        placeholder="Password"
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input text-black"
                        placeholder="Confirm Password"
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="signup-button" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Verify & Sign Up'}
                  </button>
                </>
              )}
            </form>

            <div className="login-link">
              Already have an account?{' '}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
              }}>
                Sign in here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPopup;
