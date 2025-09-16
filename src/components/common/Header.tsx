'use client';
import React, { useState } from 'react';
import { Code, History, Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const location = usePathname();
  const { isAdmin, notifications, logout } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Don't show header on admin pages unless logged in
  if (location.includes('/admin') && !isAdmin) {
    return null;
  }

  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          CheapPlayZone
        </Link>

        <nav className="flex items-center space-x-4">
          {isAdmin ? (
            <>
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full hover:bg-gray-800 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/about" className="hover:text-blue-400">
                About
              </Link>
              <Link href="/faq" className="hover:text-blue-400">
                FAQ
              </Link>
              <Link
                href="/redeem"
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                <Code size={16} className="mr-2" />
                Redeem Code
              </Link>
              <Link
                href="/track-order"
                className="flex items-center hover:text-blue-400"
              >
                <History size={16} className="mr-1" />
                Track Order
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
