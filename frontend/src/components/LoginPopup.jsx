import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const LoginPopup = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(formData);
    setIsLoading(false);

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      onClose();
      setFormData({ email: '', password: '' });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    setFormData({ email: '', password: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif]">
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[1000] opacity-0 animate-[fadeIn_0.3s_ease_forwards]"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-[90%] max-w-[400px] max-h-[90vh] overflow-y-auto relative scale-90 translate-y-5 animate-[slideIn_0.3s_ease_forwards]">
          <button 
            className="absolute top-4 right-4 bg-none border-none cursor-pointer p-2 rounded-full transition-all duration-200 ease-in text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            onClick={handleClose}
          >
            <X size={20} />
          </button>

          <div className="py-8 px-8 text-center border-b border-gray-100">
            <img
              src="https://www.vinsys.com/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
              alt="Vinsys Logo"
              className="w-[100px] h-[80px] mx-auto"
            />
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Welcome Back</h2>
            <p className="text-gray-700 text-sm">Sign in to your account to continue</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-base transition-all duration-300 ease-in bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-gray-900 placeholder-gray-400 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <div className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg text-base transition-all duration-300 ease-in bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-gray-900 placeholder-gray-400 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-1 rounded text-gray-500 hover:text-indigo-600 transition-colors duration-200 ease-in"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    {errors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-400 to-orange-600 text-white rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 ease-in relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading && (
                  <div className="inline-block w-4 h-4 border-2 border-white border-opacity-30 rounded-full border-t-white animate-spin mr-2"></div>
                )}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-100 text-gray-700 text-sm">
              Don't have an account?{' '}
              <a
                href="#"
                className="text-indigo-600 font-semibold ml-1 no-underline hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToSignup();
                }}
              >
                Sign up here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;