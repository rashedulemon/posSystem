import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function PaymentModal({ isOpen, onClose, onConfirmPayment }) {
  const { grandTotal, customerName } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card' | 'mobile'
  const [amountPaid, setAmountPaid] = useState(grandTotal.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setAmountPaid(grandTotal.toFixed(2));
    setErrorMsg('');
  }, [grandTotal, isOpen]);

  if (!isOpen) return null;

  const paidVal = parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, paidVal - grandTotal);
  const isInsufficient = paymentMethod === 'cash' && paidVal < grandTotal;

  const quickPresets = [
    { label: 'Exact', value: grandTotal.toFixed(2) },
    { label: '$10', value: '10.00' },
    { label: '$20', value: '20.00' },
    { label: '$50', value: '50.00' },
    { label: '$100', value: '100.00' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInsufficient) {
      setErrorMsg('Cash received is less than total amount due.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onConfirmPayment({
        paymentMethod,
        amountPaid: paidVal,
        changeDue: Number(changeDue.toFixed(2))
      });
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Payment</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer: {customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Total Payable Banner */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white text-center shadow-lg shadow-indigo-500/20">
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
              Total Amount Payable
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              ${grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'mobile', label: 'Mobile Pay', icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id !== 'cash') setAmountPaid(grandTotal.toFixed(2));
                    }}
                    className={`p-3.5 rounded-2xl font-semibold text-xs flex flex-col items-center justify-center space-y-2 border transition-all ${
                      active
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Specific Inputs & Presets */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Cash Tendered ($)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setAmountPaid(preset.value)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Live Change Due Display */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Change Due</span>
                <span className={`text-lg font-black ${changeDue > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                  ${changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Confirm Action */}
          <button
            type="submit"
            disabled={isSubmitting || isInsufficient}
            className={`w-full h-12 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
              isSubmitting || isInsufficient
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirm & Complete Sale</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
