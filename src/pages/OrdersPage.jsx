import React, { useState, useEffect } from 'react';
import { Receipt, Search, Eye, CreditCard, Banknote, Smartphone, Loader2, Calendar } from 'lucide-react';
import { api } from '../services/api';
import ReceiptModal from '../components/checkout/ReceiptModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.cashier_name && o.cashier_name.toLowerCase().includes(q))
    );
  });

  const getMethodBadge = (method) => {
    switch (method) {
      case 'cash':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </span>
        );
      case 'card':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </span>
        );
      case 'mobile':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Pay</span>
          </span>
        );
      default:
        return <span className="uppercase text-xs font-semibold">{method}</span>;
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-3 text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-semibold text-sm">Loading Order History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Receipt className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Order History</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review past transactions, payment details, and reprint receipts.
          </p>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Cashier, or Customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">
          Total Recorded Orders: {orders.length}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold border-b border-gray-100 dark:border-gray-700">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const dateFormatted = order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : 'N/A';
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-900 dark:text-white font-semibold">
                        {order.customer_name || 'Walk-in Customer'}
                      </td>
                      <td className="py-3.5 px-4">{getMethodBadge(order.payment_method)}</td>
                      <td className="py-3.5 px-4 font-black text-sm text-gray-900 dark:text-white">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 capitalize">
                          {order.status || 'completed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsReceiptOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No order records found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Viewer Popup Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        orderData={selectedOrder}
      />
    </div>
  );
}
