import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useAuthStore, useModalStore } from "../stores";
import { useNavigate } from "react-router-dom";
import { TbLogout } from "react-icons/tb";
import { MdSettingsSuggest } from "react-icons/md";

const Navbar: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {

  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const logout = useAuthStore().logout;
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <nav
        className={`navbar sticky w-full top-0 left-0 z-50 shadow-lg bg-base-300 transition-all duration-300 ease-in-out transform ${
          showNavbar
            ? "translate-y-0 opacity-100 visible"
            : "-translate-y-full opacity-0 invisible"
        }`}
      >
        <div className='navbar-start'>
          <Link to='/' className='btn btn-ghost hover:bg-transparent text-xl'>
            <img src="logo-nobg.svg" alt="logo" width="35" />
            WorkSync
          </Link>
        </div>
        <div className='navbar-end'>
          {isLoggedIn ? (
            <div className='dropdown dropdown-end'>
              <div
                tabIndex={0}
                role='button'
                className='btn btn-ghost btn-circle avatar'
              >
                <div className='w-10 rounded-full'>
                  <img
                    alt='Tailwind CSS Navbar component'
                    src={user?.userProfile}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className='menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-40 p-2 shadow'
              >
                <li>
                  <Link to='/profile' className='justify-between'>
                    Profile <MdSettingsSuggest className='ml-14' />
                  </Link>
                </li>
                <li>
                  <button onClick={() => logout(navigate)}>
                    Logout <TbLogout className='ml-14' />
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className='flex space-x-4'>
              <button
                onClick={() => openModal("login")}
                className='btn border-0 border-b-4 hover:border-purple-600'
              >
                Login
              </button>
              <button
                onClick={() => openModal("signup")}
                className='btn border-0 border-b-4 hover:border-purple-600'
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>
      <LoginModal />
      <SignupModal />
    </>
  );
};

export default Navbar;
