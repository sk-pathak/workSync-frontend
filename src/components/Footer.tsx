import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer bottom-0 p-10 bg-base-200 text-base-content">
      <div>
        <h2 className="footer-title">Company</h2>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      
      <div>
        <h2 className="footer-title">Follow Us</h2>
        <div className="flex space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M10 2v4H6v4h4v12h4V10h3l1-4h-4V2h-4z"/>
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M23 3a10.6 10.6 0 01-3.03.83 4.52 4.52 0 001.98-2.48 9.48 9.48 0 01-3.02 1.17A4.48 4.48 0 0016.79 2a4.5 4.5 0 00-4.5 4.5c0 .35.04.69.12 1.02a12.8 12.8 0 01-9.24-4.69A4.48 4.48 0 004.44 5.8a4.47 4.47 0 001.38-.56 4.48 4.48 0 001.33 6.33A4.48 4.48 0 015.4 11a4.48 4.48 0 004.13-3.06 4.49 4.49 0 004.07-3.34c2.88 0 5.39 2.32 5.39 5.2 0 .4-.03.79-.09 1.18A12.7 12.7 0 0123 3z"/>
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4.98 3.5C4.98 3.5 4.99 3.5 5 3.5h.02c.8 0 1.44-.64 1.44-1.44C6.46 1.26 5.82.62 5.02.62h-.03c-.8 0-1.43.64-1.44 1.44-.01.8.64 1.44 1.44 1.44zm-.88 3.64c-.56 0-.97.47-.97 1.03v7.2c0 .56.42 1.03.97 1.03h1.94c.56 0 1.03-.47 1.03-1.03v-7.2c0-.56-.47-1.03-1.03-1.03h-1.94zm4.62 0c-.56 0-.97.47-.97 1.03v7.2c0 .56.42 1.03.97 1.03h1.94c.56 0 1.03-.47 1.03-1.03v-7.2c0-.56-.47-1.03-1.03-1.03h-1.94zm1.95 1.5h-.99v7.11h.99c.56 0 1.03-.47 1.03-1.03v-7.2c0-.56-.47-1.03-1.03-1.03h-1.94z"/>
            </svg>
          </a>
        </div>
      </div>

      <div>
        <h2 className="footer-title">Contact</h2>
        <p>Email: sumitpathak2002@gamil.com</p>
        <p>Phone: +91 830 631 2679</p>
      </div>
    </footer>
  );
};

export default Footer;
