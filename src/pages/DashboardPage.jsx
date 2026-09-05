import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Download, RefreshCw, Loader2, Award, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData, prodsData] = await Promise.all([
        api.getOrders(),
        api.getProducts()
      ]);
      setOrders(ordersData);
      setProducts(prodsData);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockCount = products.filter(p => p.stock_qty <= 5).length;

  // Compute Top Selling Products
  const productSalesMap = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      const pName = item.product_name || 'Unknown Item';
      if (!productSalesMap[pName]) {
        productSalesMap[pName] = { qty: 0, revenue: 0 };
      }
      productSalesMap[pName].qty += Number(item.qty || 1);
      productSalesMap[pName].revenue += Number(item.subtotal || 0);
    });
  });

  const topSellingList = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // CSV Sales Report Exporter
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No sales data available to export.');
      return;
    }

    const headers = ['Order ID', 'Date', 'Cashier', 'Customer', 'Payment Method', 'Subtotal', 'Discount', 'Tax', 'Total Amount'];
    const rows = orders.map(o => [
      o.id,
      o.created_at ? new Date(o.created_at).toISOString() : '',
      `"${o.cashier_name || 'Staff'}"`,
      `"${o.customer_name || 'Walk-in Customer'}"`,
      o.payment_method,
      o.subtotal,
      o.discount,
      o.tax,
      o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset all demo data (products, categories, orders) back to default settings?')) {
      api.resetMockData();
      loadDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-3 text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-semibold text-sm">Computing Sales Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Store Performance & Analytics</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time sales revenue, top products, and inventory health metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDemoData}
            className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1.5"
            title="Reset Mock Demo Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            ${totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
            Gross store sales
          </span>
        </div>

        {/* Orders Completed */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Sales Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {totalOrders}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
            Completed checkout tickets
          </span>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Avg Order Value</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            ${avgOrderValue.toFixed(2)}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 inline-block">
            Average transaction spend
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Low Stock Alerts</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              lowStockCount > 0 
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {lowStockCount}
          </p>
          <span className={`text-[11px] font-medium mt-1 inline-block ${
            lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
          }`}>
            {lowStockCount > 0 ? 'Items need reordering' : 'Stock levels healthy'}
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Selling Products List */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 p-5 shadow-soft">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Top Selling Products</h3>
            </div>
            <span className="text-xs text-gray-400">By quantity sold</span>
          </div>

          <div className="space-y-3">
            {topSellingList.length > 0 ? (
              topSellingList.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.qty} units sold</span>
                    </div>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions Activity */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 p-5 shadow-soft">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Recent Sales Feed</h3>
            </div>
            <span className="text-xs text-gray-400">Latest 5 sales</span>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{o.id}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{o.customer_name || 'Walk-in'}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                    {o.items?.length || 1} items • Paid via {o.payment_method}
                  </span>
                </div>
                <span className="font-black text-sm text-gray-900 dark:text-white">
                  ${Number(o.total).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
