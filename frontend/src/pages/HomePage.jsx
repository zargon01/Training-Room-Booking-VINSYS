import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Calendar, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useRoomStore } from '../store/room';
import { useUserStore } from '../store/user';
import LoginPopup from '../components/LoginPopup';
import SignupPopup from '../components/SignupPopup';
import '../styles/LandingPage.css';

export default function HomePage() {
  const { rooms = [], getRooms } = useRoomStore();
  const { users = [], getUsers } = useUserStore();
  const { user } = useAuthStore();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  useEffect(() => {
    getRooms();
    getUsers();
  }, [getRooms, getUsers]);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} />;
  }

  return (
    <div className="landing-page">
      {/* ✅ Login Popup */}
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />

      {/* ✅ Signup Popup */}
      <SignupPopup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <div className="floating-elements">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          <img
            src="https://www.vinsys.com/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75"
            alt="Vinsys Logo"
            style={{ width: '52px', height: '42px' }}
            
          />
          Room Booking System
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => setIsLoginOpen(true)}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => setIsSignupOpen(true)}>
            Sign Up <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>Room Booking System</h1>
        <p>
          Streamline your training room reservations with our intuitive booking system.
          Reserve rooms, manage schedules, and coordinate resources all in one place.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-primary btn-large" onClick={() => setIsSignupOpen(true)}>
            Get Started Free
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon"><Calendar /></div>
          <h3>Easy Scheduling</h3>
          <p>Intuitive calendar interface makes booking training rooms quick and effortless.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Clock /></div>
          <h3>Real-time Availability</h3>
          <p>See room availability instantly and avoid double bookings with live updates.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Users /></div>
          <h3>Team Management</h3>
          <p>Coordinate with team members and manage group bookings seamlessly.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><CheckCircle /></div>
          <h3>Instant Confirmations</h3>
          <p>Get immediate email confirmations and notifications for all your bookings.</p>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="stat-number">{rooms.length}</div>
          <div className="stat-label">Rooms Available</div>
        </div>
        <div className="stat">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Booking Access</div>
        </div>
        <div className="stat">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Happy Users</div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 AWS OJT Batch 4. All rights reserved.</p>
      </footer>
    </div>
  );
}
