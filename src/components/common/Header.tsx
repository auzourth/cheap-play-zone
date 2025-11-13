'use client';
import React, { useState } from 'react';
import { History, Bell } from 'lucide-react';
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
    <header className="bg-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl font-bold">Chape Play Zone</h1>
        </Link>

        <nav className="flex items-center space-x-6">
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
              <Link
                href="/how-it-works"
                className="text-gray-300 hover:text-orange-400"
              >
                How To Open a Case
              </Link>
              <Link href="/faq" className="text-gray-300 hover:text-orange-400">
                FAQ
              </Link>
              {/* <Link
                href="/redeem"
                className="flex items-center text-gray-300 hover:text-orange-400"
              >
                <Code size={16} className="mr-2" />
                Redeem Code
              </Link> */}
              <Link
                href="/track-order"
                className="flex items-center text-gray-300 hover:text-orange-400"
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
