import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface RedemptionNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  code?: string;
}

interface NotificationsProps {
  notifications: RedemptionNotification[];
  setNotifications: React.Dispatch<
    React.SetStateAction<RedemptionNotification[]>
  >;
  router: AppRouterInstance;
  clearAllNotifications: () => void;
  markAllNotificationsAsRead: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  setNotifications,
  router,
  clearAllNotifications,
  markAllNotificationsAsRead,
}) => {
  useEffect(() => {
    const checkForNewRedemptions = async () => {
      const { data, error } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('isRedeemed', true)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error checking for redemptions:', error);
        return;
      }

      if (data && data.length > 0) {
        const currentNotificationIds = notifications.map((n) => n.id);
        const newRedemptions = data.filter(
          (order) => !currentNotificationIds.includes(order.id)
        );
        if (newRedemptions.length > 0) {
          const newNotifications = newRedemptions.map((order) => ({
            id: order.id,
            message: `Order ${order.code} has been redeemed`,
            time: new Date(order.updated_at).toLocaleString(),
            read: false,
            orderId: order.id,
            code: order.code,
          }));
          setNotifications((prev) => [...newNotifications, ...prev]);
        }
      }
    };
    const intervalId = setInterval(checkForNewRedemptions, 60000);
    return () => clearInterval(intervalId);
  }, [notifications, setNotifications]);

  return (
    <div className="relative">
      <button
        className="p-2 text-gray-300 hover:text-white transition-colors relative"
        onClick={() => {
          const notificationsElement = document.getElementById(
            'notifications-dropdown'
          );
          if (notificationsElement) {
            notificationsElement.classList.toggle('hidden');
            markAllNotificationsAsRead();
          }
        }}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>
      <div
        id="notifications-dropdown"
        className="hidden absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg z-10"
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-medium">Recent Redemptions</h3>
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
                    <p className="text-white mb-1">{notification.message}</p>
                    <p className="text-gray-400 text-sm">{notification.time}</p>
                    {notification.orderId && (
                      <button
                        onClick={() =>
                          router.push(`/admin/orders/${notification.orderId}`)
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
  );
};

export default Notifications;
