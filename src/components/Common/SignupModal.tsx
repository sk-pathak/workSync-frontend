import React, { useState } from "react";
import { useAuthStore, useModalStore } from "../../stores";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SignupModal: React.FC = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const signup = useAuthStore().register;
  const navigate = useNavigate();

  const { modals, openModal, closeModal } = useModalStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          "File is too large. Please select an image smaller than 5MB."
        );
        return;
      }
      setSelectedImage(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append(
      "user",
      new Blob(
        [
          JSON.stringify({
            name,
            username,
            email,
            password,
          }),
        ],
        { type: "application/json" }
      )
    );
    if (selectedImage) {
      formData.append("image", selectedImage as Blob);
    }

    await signup(formData, navigate);

    setName("");
    setEmail("");
    setUsername("");
    setPassword("");

    closeModal("signup");
    navigate("/");
  };

  return (
    <>
      {modals.signup && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/85'
          onClick={() => closeModal("signup")}
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
              <div className='space-y-4'>
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text text-lg'>
                      Upload Profile Image
                    </span>
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='file-input file-input-bordered w-full file-input-primary'
                  />
                </div>
                {previewUrl && (
                  <div className='mt-4'>
                    <div className='flex flex-col items-center'>
                      <img
                        src={previewUrl}
                        alt='Image Preview'
                        width={200}
                        className='rounded-lg shadow-lg border-2 border-gray-200'
                      />
                      <button
                        type='button'
                        onClick={handleRemoveImage}
                        className='btn btn-error mt-2'
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    closeModal("signup");
                    openModal("login");
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
