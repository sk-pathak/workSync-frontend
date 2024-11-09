import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";

type SingupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SignupModal: React.FC<SingupModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = useAuthStore().register;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      username,
      email,
      password,
    };

    await signup(data);

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
              Sign Up for WorkSync
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='text'
                placeholder='Full Name'
                className='input input-bordered w-full'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type='text'
                placeholder='Username'
                className='input input-bordered w-full'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type='email'
                placeholder='Email'
                className='input input-bordered w-full'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Sign Up
              </button>
            </form>
            <div className='mt-4 text-center'>
              <p>
                Already have an account?{" "}
                <button
                  className='link'
                  onClick={() => {
                    onClose();
                  }}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignupModal;
