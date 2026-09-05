import React from 'react';
import { Printer, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, orderData, onNewSale }) {
  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = orderData.created_at
    ? new Date(orderData.created_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-sm">Sale Completed!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Receipt generated successfully</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div
            id="printable-receipt"
            className="bg-white text-gray-900 p-6 rounded-2xl shadow-soft border border-gray-200 font-mono text-xs max-w-xs mx-auto space-y-4"
          >
            {/* Receipt Store Branding Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-300">
              <h2 className="font-bold text-base uppercase tracking-wider text-gray-900">AURA RETAIL POS</h2>
              <p className="text-[10px] text-gray-500">123 Market Street, Suite 100</p>
              <p className="text-[10px] text-gray-500">Tel: (555) 019-2831</p>
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 text-[11px] text-gray-600 pb-3 border-b border-dashed border-gray-300">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold text-gray-900">{orderData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{orderData.cashier_name || 'Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{orderData.customer_name || 'Walk-in Customer'}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 pb-3 border-b border-dashed border-gray-300">
              <div className="grid grid-cols-12 font-bold text-gray-700 pb-1 border-b border-gray-200">
                <span className="col-span-6">ITEM</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-4 text-right">TOTAL</span>
              </div>
              {orderData.items?.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-gray-800 text-[11px]">
                  <span className="col-span-6 truncate font-medium">{item.product_name}</span>
                  <span className="col-span-2 text-center">x{item.qty}</span>
                  <span className="col-span-4 text-right">${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="space-y-1 text-[11px] text-gray-700 pb-3 border-b border-dashed border-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${Number(orderData.subtotal).toFixed(2)}</span>
              </div>
              {Number(orderData.discount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-${Number(orderData.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${Number(orderData.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-gray-900 pt-1">
                <span>TOTAL:</span>
                <span>${Number(orderData.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-1 text-[11px] text-gray-600">
              <div className="flex justify-between">
                <span>Paid via ({orderData.payment_method?.toUpperCase()}):</span>
                <span>${Number(orderData.amount_paid || orderData.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Change Due:</span>
                <span>${Number(orderData.change_due || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer barcode/thank you */}
            <div className="text-center pt-3 border-t border-dashed border-gray-300 text-[10px] text-gray-500">
              <p className="font-semibold text-gray-700">Thank you for shopping with us!</p>
              <p>Please keep this receipt for returns/exchanges.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          
          <button
            onClick={() => {
              onClose();
              if (onNewSale) onNewSale();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center space-x-2"
          >
            <span>New Sale</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
