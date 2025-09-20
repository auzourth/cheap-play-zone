'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, NotificationType } from '../types';
import { getCookie, setCookie } from '../lib/cookies';
import { supabase, checkAdminSession } from '../lib/supabase';

interface AppContextType {
  orders: Order[];
  notifications: NotificationType[];
  addOrder: (order: Omit<Order, 'id' | 'created' | 'status'>) => void;
  updateOrderStatus: (
    id: string,
    status: 'pending' | 'completed',
    loginInfo?: string
  ) => void;
  findOrderByCode: (code: string) => Order | undefined;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addNotification: (
    notification: Omit<NotificationType, 'id' | 'created_at'>
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const savedOrders = async () => {
    const order = await getCookie('orders');
    return order;
  };

  const savedNotifications = async () => {
    const notification = await getCookie('notifications');
    return notification;
  };

  useEffect(() => {
    if (savedOrders) {
      try {
        setOrders(JSON.parse(String(savedOrders)));
      } catch (e) {
        console.error('Error parsing orders:', e);
      }
    } else {
      setOrders([]);
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(String(savedNotifications)));
      } catch (e) {
        console.error('Error parsing notifications:', e);
        setNotifications([]);
      }
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      setCookie('orders', JSON.stringify(orders), {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
  }, [orders]);

  useEffect(() => {
    if (notifications.length > 0) {
      setCookie('notifications', JSON.stringify(notifications), {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
  }, [notifications]);

  useEffect(() => {
    setCookie('isAdmin', isAdmin.toString(), {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
  }, [isAdmin]);

  // Check Supabase admin session on mount
  useEffect(() => {
    const checkAdmin = async () => {
      const isAdminUser = await checkAdminSession();
      setIsAdmin(isAdminUser);
    };

    checkAdmin();
  }, []);

  const addOrder = (order: Omit<Order, 'id' | 'created' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(2, 9),
      created: new Date().toISOString(),
      status: 'pending',
    };

    setOrders((prev) => [...prev, newOrder]);

    addNotification({
      message: `New redemption: Code ${order.code} has been redeemed`,
      read: false,
      orderId: newOrder.id,
    });

    return newOrder;
  };

  const updateOrderStatus = (
    id: string,
    status: 'pending' | 'completed',
    loginInfo?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status, loginInfo: loginInfo || order.loginInfo }
          : order
      )
    );
  };

  const findOrderByCode = (code: string) => {
    return orders.find((order) => order.code === code);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.session) {
        setIsAdmin(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Exception during login:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const addNotification = (
    notification: Omit<NotificationType, 'id' | 'created_at'>
  ) => {
    const newNotification: NotificationType = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        notifications,
        addOrder,
        updateOrderStatus,
        findOrderByCode,
        isAdmin,
        login,
        logout,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
