import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useModalStore } from "../../stores";

const LoginModal: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore().login;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password, navigate);
    setUsername("");
    setPassword("");

    closeModal("login");
    navigate("/");
  };

  const { modals, openModal, closeModal } = useModalStore();

  return (
    <>
      {modals.login && (
        <div
          role='dialog'
          aria-labelledby='login-modal-title'
          aria-hidden={!modals.login}
          aria-modal={true}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/85'
          onClick={() => closeModal("login")}
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
                    closeModal("login");
                    openModal("signup");
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
