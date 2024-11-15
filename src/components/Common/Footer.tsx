import React from "react";
import { FaGithub, FaLinkedin, FaReddit } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from '/banner-nobg.svg';

const Footer: React.FC = () => {
  return (
    <footer className='footer p-10 pt-0 bg-base-200 text-base-content mt-10'>
      <div className='grid grid-cols-1 pt-12 pr-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-14'>
        {/* Company Section */}
        <div>
          <h2 className='footer-title'>Company</h2>
          <ul className='space-y-2'>
            <li>
              <Link
                to='/'
                className='link no-underline hover:text-purple-600 transform hover:p-2 transition-all duration-300'
              >
                Home
              </Link>
            </li>
            <li>
              <Link to="/aboutme"
                className='link no-underline hover:text-purple-600 transform hover:p-2 transition-all duration-300'
              >
                About
              </Link>
            </li>
            <li>
              <a
                href='#'
                className='link no-underline hover:text-purple-600 transform hover:p-2 transition-all duration-300'
              >
                Services
              </a>
            </li>
            <li>
              <a
                href='#'
                className='link no-underline hover:text-purple-600 transform hover:p-2 transition-all duration-300'
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div>
          <h2 className='footer-title'>Follow Us</h2>
          <div className='flex space-x-4'>
            <a
              href='https://github.com/sk-pathak'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
            >
              <FaGithub className='h-6 w-6 text-white hover:text-gray-300 transition' />
            </a>
            <a
              href='https://linkedin.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='LinkedIn'
            >
              <FaLinkedin className='h-6 w-6 text-blue-700 hover:text-blue-900 transition' />
            </a>
            <a
              href='https://reddit.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Reddit'
            >
              <FaReddit className='h-6 w-6 text-orange-600 hover:text-orange-800 transition' />
            </a>
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <h2 className='footer-title'>Contact</h2>
          <p>
            Email:{" "}
            <a
              href='mailto:sumitpathak2002@gmail.com'
              className='link no-underline hover:text-purple-400 transition-transform duration-300 transform hover:translate-x-2'
            >
              sumitpathak2002@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a
              href='tel:+918306312679'
              className='link no-underline hover:text-purple-400 transition-transform duration-300 transform hover:translate-x-2'
            >
              +91 830 631 2679
            </a>
          </p>
        </div>
      </div>

      {/* Bottom text */}
      <div className='flex items-center pt-4 justify-between text-lg text-base-content'>
        <img src={logo} alt="Logo" className='h-40 w-auto pr-10' />
        <p>© 2024 workSync. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
