// SignInModal.js
import React from 'react';
import { useAuth } from './path-to-useAuth'; // Update the path accordingly

const SignInModal = ({ isOpen, onClose, redirectPath }) => {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle(redirectPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button onClick={onClose}>Close</button>
        <button onClick={handleSignIn}>Sign in with Google</button>
      </div>
    </div>
  );
};

export default SignInModal;
