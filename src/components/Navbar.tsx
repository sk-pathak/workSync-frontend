import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Navbar: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const openSignupModal = () => setSignupModalOpen(true);
  const closeSignupModal = () => setSignupModalOpen(false);

  return (
    <div className="navbar shadow-lg bg-base-200">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">WorkSync</Link>
      </div>
      <div className="navbar-end">
        {isLoggedIn ? (
          <Link to="/profile" className="btn">Profile</Link>
        ) : (
          <div className="flex space-x-4">
            <button onClick={openLoginModal} className="btn border-0 border-b-4 hover:border-purple-600">Login</button>
            <button onClick={openSignupModal} className="btn border-0 border-b-4 hover:border-purple-600">Register</button>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
      />
    </div>
  );
};

export default Navbar;
