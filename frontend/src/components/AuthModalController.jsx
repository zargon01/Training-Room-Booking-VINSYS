// src/components/AuthModalController.jsx
import React, { useState } from 'react';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';

const AuthModalController = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <>
      {/* You can place this trigger anywhere, like in Navbar */}
      <button onClick={openLogin} className="trigger-button">Login</button>

      <LoginPopup
        isOpen={showLogin}
        onClose={closeModals}
        onSwitchToSignup={openSignup}
      />

      <SignupPopup
        isOpen={showSignup}
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />
    </>
  );
};

export default AuthModalController;
