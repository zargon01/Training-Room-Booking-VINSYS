import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ChevronDown,
  LogOut,
  Settings,
  Calendar,
  Home,
  MapPin,
  Users as UsersIcon
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const dropdownRef = useRef(null);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, route: '/' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, route: '/bookings' },
    { id: 'rooms', label: 'Rooms', icon: MapPin, route: '/rooms' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'users', label: 'Users', icon: UsersIcon, route: '/admin/users' });
  }

  const handleNavClick = (itemId, route) => {
    setActiveItem(itemId);
    navigate(route);
  };

  const handleUserAction = (action) => {
    setIsUserDropdownOpen(false);
    if (action === 'logout') {
      logout();
      setTimeout(() => navigate('/'), 100); // ⏱️ delay to ensure user state clears
    } else if (action === 'edit') {
      navigate(`/users/${user._id}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null; // Hide navbar if user is not logged in

  return (
    <nav style={navbarStyle}>
      <div style={blurTopRight}></div>
      <div style={blurBottomLeft}></div>

      <div style={containerStyle}>
        <div style={navContentStyle}>
          {/* Brand */}
          <h1 style={logoStyle}>
            <span style={highlightText}></span><span style={{ color: 'white' }}>Training Room Booking</span>
          </h1>

          {/* Navigation Items */}
          <div style={navItemsStyle}>
            {navItems.map(({ id, label, icon: Icon, route }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id, route)}
                style={activeItem === id ? activeNavButtonStyle : navButtonStyle}
              >
                <Icon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                {label}
              </button>
            ))}
          </div>

          {/* User Dropdown */}
          <div style={userDropdownStyle} ref={dropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(prev => !prev)}
              style={userButtonStyle}
            >
              <div style={avatarStyle}>
                <User style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <span style={{ marginRight: '8px', fontWeight: '500' }}>{user.name}</span>
              <ChevronDown
                style={{
                  width: '16px',
                  height: '16px',
                  transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </button>

            {isUserDropdownOpen && (
              <div style={dropdownStyle}>
                <div style={dropdownHeaderStyle}>
                  <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{user.email}</p>
                </div>
                <button
                  onClick={() => handleUserAction('edit')}
                  style={dropdownItemStyle}
                >
                  <Settings style={dropdownIcon} />
                  Edit Profile
                </button>
                <button
                  onClick={() => handleUserAction('logout')}
                  style={dropdownItemStyle}
                >
                  <LogOut style={{ ...dropdownIcon, color: '#ff6b6b' }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Styles
const navbarStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  position: 'relative',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  position: 'relative',
  zIndex: 10
};

const navContentStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '64px'
};

const logoStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
};

const highlightText = {
  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const navItemsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const navButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  border: 'none',
  background: 'transparent',
  color: 'white',
  cursor: 'pointer'
};

const activeNavButtonStyle = {
  ...navButtonStyle,
  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
};

const userDropdownStyle = {
  position: 'relative'
};

const userButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  color: 'white',
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  cursor: 'pointer'
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
  border: '2px solid rgba(255,255,255,0.5)'
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  width: '250px',
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  border: '1px solid rgba(0,0,0,0.1)',
  zIndex: 1000
};

const dropdownHeaderStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '12px 16px',
  color: 'white'
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#374151',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const dropdownIcon = {
  width: '16px',
  height: '16px',
  marginRight: '12px',
  color: '#667eea'
};

const blurTopRight = {
  position: 'absolute',
  top: '-16px',
  right: '-16px',
  width: '96px',
  height: '96px',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '50%',
  filter: 'blur(40px)'
};

const blurBottomLeft = {
  position: 'absolute',
  bottom: '-16px',
  left: '-16px',
  width: '128px',
  height: '128px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '50%',
  filter: 'blur(40px)'
};

export default Navbar;
