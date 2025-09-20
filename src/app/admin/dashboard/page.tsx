'use client';
import React, { useState, useEffect } from 'react';
import { Search, Copy, Plus, Trash } from 'lucide-react';
import { Order } from '../../../types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CodeGeneratorModal from '@/components/common/CodeGeneratorModal';
import Modal from '@/components/common/Modal';

// ...existing code...
import Notifications from '@/components/common/Notifications';

// Extend the Notification interface
interface RedemptionNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  code?: string;
}

const AdminDashboardPage: React.FC = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notifications, setNotifications] = useState<RedemptionNotification[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load orders from Supabase, with debounced search
  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      setIsLoading(true);

      // Check authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        router.push('/admin/login');
        return;
      }

      // Build query for orders (paged & filtered)
      let query = supabase
        .from('cheap-play-zone')
        .select('*')
        .order('created_at', { ascending: false })
        .range(
          0 + (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      if (debouncedSearchTerm.trim()) {
        // Supabase doesn't support OR in .eq, so use ilike with pattern
        const term = `%${debouncedSearchTerm.trim()}%`;
        query = query.or(
          `code.ilike.${term},name.ilike.${term},email.ilike.${term}`
        );
      }
      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        setOrders([]);
      } else if (ordersData) {
        const formattedOrders: Order[] = ordersData.map((order) => ({
          id: order.id,
          code: order.code,
          orderId: order.orderId || null,
          status: order.status || 'pending',
          loginInfo: order.loginInfo || null,
          email: order.email || null,
          name: order.name || null,
          created: order.created_at,
          isRedeemed: order.isRedeemed || false,
        }));
        setOrders(formattedOrders);

        // Extract recently redeemed orders for notifications
        const redeemedOrders = formattedOrders.filter(
          (order) =>
            order.isRedeemed &&
            new Date(order.created).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000 // Within last 7 days
        );

        // Convert redeemed orders to notifications
        const redemptionNotifications: RedemptionNotification[] =
          redeemedOrders.map((order) => ({
            id: order.id,
            message: `Order ${order.code} has been redeemed`,
            time: new Date(order.created).toLocaleString(),
            read: false,
            orderId: order.id,
            code: order.code,
          }));

        setNotifications(redemptionNotifications);
      }

      // Get total count (filtered)
      let countQuery = supabase
        .from('cheap-play-zone')
        .select('*', { count: 'exact', head: true });
      if (statusFilter) {
        countQuery = countQuery.eq('status', statusFilter);
      }
      if (debouncedSearchTerm.trim()) {
        const term = `%${debouncedSearchTerm.trim()}%`;
        countQuery = countQuery.or(
          `code.ilike.${term},name.ilike.${term},email.ilike.${term}`
        );
      }
      const { count, error: countError } = await countQuery;
      if (!countError && typeof count === 'number') {
        setTotalRows(count);
      } else {
        setTotalRows(0);
      }

      setIsLoading(false);
    };

    checkSessionAndLoadData();
  }, [
    router,
    refreshTrigger,
    statusFilter,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
  ]);

  // Pagination logic (now using totalRows from Supabase count)
  const totalPages = Math.ceil(totalRows / itemsPerPage);
  const currentItems = orders;

  const handleSelectAll = () => {
    if (selectedOrders.length === currentItems.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentItems.map((order) => order.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/redeem/${code}`);
  };

  const handleAddLoginInfo = (id: string) => {
    router.push(`/admin/orders/${id}`);
  };

  // Open delete confirmation modal
  const handleDeleteOrder = (orderCode: string) => {
    setOrderToDelete(orderCode);
    setIsDeleteModalOpen(true);
  };

  // Confirm and execute delete
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    console.log('Cancelling order with code:', orderToDelete);
    try {
      const { error } = await supabase
        .from('cheap-play-zone')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('code', orderToDelete);

      if (error) {
        alert(`Error cancelling order: ${error.message}`);
        return;
      }

      // Refresh data after cancellation
      setRefreshTrigger((prev) => prev + 1);

      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error('Exception when cancelling order:', err);
      alert('An error occurred while cancelling the order');
    }
  };

  // Cancel delete
  const cancelDeleteOrder = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;

    try {
      const { error } = await supabase
        .from('cheap-play-zone')
        .delete()
        .in('id', selectedOrders);

      if (error) {
        console.error('Error deleting from Supabase:', error);
        return;
      }

      // Refresh data after deletion
      setRefreshTrigger((prev) => prev + 1);
      setSelectedOrders([]);
    } catch (err) {
      console.error('Exception when deleting orders:', err);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const orderToDeleteData = orders.find(
    (order) => order.code === orderToDelete
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteOrder}
        title="Confirm Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to cancel this order?
          </p>

          {orderToDeleteData && (
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm">
                <span className="font-medium">Code:</span>{' '}
                {orderToDeleteData.code}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span>{' '}
                {orderToDeleteData.email || 'N/A'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Current Status:</span>{' '}
                {orderToDeleteData.status}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center items-end">
            <button
              onClick={cancelDeleteOrder}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteOrder}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        <Notifications
          notifications={notifications}
          setNotifications={setNotifications}
          router={router}
          clearAllNotifications={clearAllNotifications}
          markAllNotificationsAsRead={markAllNotificationsAsRead}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by code, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-3 pl-10 text-white"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page > 0 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="w-16 bg-gray-800 border border-gray-700 rounded p-2 text-white text-center"
          />
          <span>of {totalPages}</span>
        </div>

        {/* Status Filter Button */}
        <div className="relative ml-2 flex-1 flex justify-end">
          <button
            onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
          >
            {statusFilter
              ? `Status: ${
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                }`
              : 'Filter by Status'}
          </button>
          {isStatusDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-20">
              {['pending', 'delivered', 'processing', 'completed'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsStatusDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                      statusFilter === status
                        ? 'bg-purple-700 text-white'
                        : 'text-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
              <button
                onClick={() => {
                  setStatusFilter(null);
                  setIsStatusDropdownOpen(false);
                  setCurrentPage(1);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-400"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            Generate Codes
          </button>
          <button
            onClick={handleSelectAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Select All
          </button>
        </div>
      </div>

      <CodeGeneratorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3 text-left">Select</th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Copy</th>
              <th className="p-3 text-left">Add Game Information</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((order: Order) => (
              <tr
                key={order.id}
                className={`border-t border-gray-700 hover:bg-gray-750 ${
                  order.isRedeemed ? 'bg-green-900/20' : ''
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelect(order.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="p-3">{order.id || '-'}</td>
                <td className="p-3">{order.name || '-'}</td>
                <td className="p-3">{order.email || '-'}</td>
                <td className="p-3">{order.code}</td>
                <td className="p-3">
                  {new Date(order.created).toLocaleString()}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : order.isRedeemed
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleCopyCode(order.code)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </td>
                <td className="flex gap-4 p-3">
                  <button
                    onClick={() => handleAddLoginInfo(order.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.code)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 rounded transition-colors"
                    disabled={order.status === 'cancelled'}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrders.length > 0 && (
        <button
          onClick={handleDeleteSelected}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
        >
          <Trash size={16} />
          Delete Selected
        </button>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-800 rounded-l-md border-r border-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1;
          if (currentPage > 3 && totalPages > 5) {
            pageNum = currentPage + i - 2;
            if (pageNum > totalPages) {
              pageNum = totalPages - (4 - i);
            }
          }

          if (pageNum <= totalPages) {
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border-r border-gray-700 ${
                  currentPage === pageNum ? 'bg-blue-600' : 'bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 bg-gray-800 rounded-r-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
