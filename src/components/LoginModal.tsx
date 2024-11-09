import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore().login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85'
          onClick={onClose}
        >
          <div
            className='w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className='text-2xl font-semibold text-center mb-6'>
              Login to WorkSync
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='text'
                placeholder='Username'
                className='input input-bordered w-full'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type='password'
                placeholder='Password'
                className='input input-bordered w-full'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type='submit' className='btn btn-primary w-full'>
                Login
              </button>
            </form>
            <div className='mt-4 text-center'>
              <p>
                Don't have an account?{" "}
                <button
                  className='link'
                  onClick={() => {
                    onClose();
                  }}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;
