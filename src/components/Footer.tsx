import React from "react";
import { FaGithub, FaLinkedin, FaReddit } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className='footer p-10 bg-base-200 text-base-content mt-10'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16'>
        {/* Company Section */}
        <div>
          <h2 className='footer-title'>Company</h2>
          <ul className='space-y-2'>
            <li>
              <a
                href='#'
                className='link link-hover no-underline hover:text-purple-600 transition'
              >
                Home
              </a>
            </li>
            <li>
              <a
                href='#'
                className='link link-hover no-underline hover:text-purple-600 transition'
              >
                About
              </a>
            </li>
            <li>
              <a
                href='#'
                className='link link-hover no-underline hover:text-purple-600 transition'
              >
                Services
              </a>
            </li>
            <li>
              <a
                href='#'
                className='link link-hover no-underline hover:text-purple-600 transition'
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
              href='https://github.com'
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
              className='link link-hover'
            >
              sumitpathak2002@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href='tel:+918306312679' className='link link-hover'>
              +91 830 631 2679
            </a>
          </p>
        </div>
      </div>

      {/* Bottom text */}
      <div className='mt-10 text-center text-lg text-base-content'>
        <p>© 2024 WorkSync. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
