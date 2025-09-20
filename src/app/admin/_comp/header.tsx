'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { signOut } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

// Notification interface
interface RedemptionNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  code?: string;
}

export default function AdminHeader() {
  const router = useRouter();
  const { isAdmin } = useAppContext();
  const [notifications, setNotifications] = useState<RedemptionNotification[]>(
    []
  );

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, router]);

  // Fetch redemption notifications
  useEffect(() => {
    const fetchRedemptionNotifications = async () => {
      try {
        // Check for recently redeemed orders
        const { data, error } = await supabase
          .from('cheap-play-zone')
          .select('*')
          .eq('isRedeemed', true)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching redemption notifications:', error);
          return;
        }

        if (data && data.length > 0) {
          // Convert to notification format
          const redemptionNotifications: RedemptionNotification[] = data.map(
            (order) => ({
              id: order.id,
              message: `Order ${order.code} has been redeemed`,
              time: new Date(order.updated_at).toLocaleString(),
              read: false,
              orderId: order.id,
              code: order.code,
            })
          );

          setNotifications(redemptionNotifications);
        }
      } catch (err) {
        console.error('Exception when fetching redemption notifications:', err);
      }
    };

    // Initial fetch
    fetchRedemptionNotifications();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Use Supabase signOut function instead of localStorage
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            Admin Panel
          </Link>

          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>

                <div className="relative">
                  <button
                    className="p-2 text-gray-300 hover:text-white transition-colors relative"
                    onClick={() => {
                      const notificationsElement = document.getElementById(
                        'admin-header-notifications'
                      );
                      if (notificationsElement) {
                        notificationsElement.classList.toggle('hidden');
                        markAllNotificationsAsRead();
                      }
                    }}
                  >
                    <Bell size={20} />
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </button>

                  <div
                    id="admin-header-notifications"
                    className="hidden absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg z-10"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-white font-medium">
                        Recent Redemptions
                      </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 p-4 text-center">
                          No recent redemptions
                        </p>
                      ) : (
                        <ul>
                          {notifications.map((notification) => (
                            <li
                              key={notification.id}
                              className="border-b border-gray-700 last:border-0"
                            >
                              <div className="p-4 hover:bg-gray-700 transition-colors">
                                <p className="text-white mb-1">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {notification.time}
                                </p>
                                {notification.orderId && (
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/admin/orders/${notification.orderId}`
                                      )
                                    }
                                    className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                                  >
                                    View Details
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-700">
                        <button
                          className="text-blue-400 hover:text-blue-300 text-sm w-full text-center"
                          onClick={clearAllNotifications}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
