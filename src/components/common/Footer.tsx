'use client';
import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CheapPlayZone</h3>
            <p className="text-gray-400">
              Pre-purchased Video Games Delivered Via Accounts
            </p>
            <p className="text-gray-400 mt-2">
              Contact us on G2A support from 06:00 to 18:00 (GMT+1)
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>

              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/redeem" className="text-gray-400 hover:text-white">
                  Redeem Code
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-gray-400 hover:text-white"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Support</h3>
            <a
              href="https://supporthub.g2a.com/marketplace/en/Problem-Solving/how-can-i-contact-the-seller-if-i-have-a-question-or-problem-with-my-item"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block transition-colors"
            >
              Need our help?
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} CheapPlayZone. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
