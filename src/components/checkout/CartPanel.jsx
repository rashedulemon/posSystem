import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Tag, ArrowRight, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPanel({ onCheckout }) {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    discountPercent,
    setDiscountPercent,
    customerName,
    setCustomerName,
    subtotal,
    discountAmount,
    taxAmount,
    taxRate,
    grandTotal,
    totalItemsCount
  } = useCart();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft-lg flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/70 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-base">Current Cart</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Customer Name Input (Optional metadata) */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center space-x-2 text-xs">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name (e.g. Walk-in Customer)"
            className="w-full bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none text-xs py-1"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100 dark:divide-gray-700/50">
        {items.length > 0 ? (
          items.map(({ product, quantity }) => (
            <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    {product.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    ${Number(product.price).toFixed(2)} each
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Subtotal */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center shadow-xs transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[56px]">
                  <span className="font-bold text-gray-900 dark:text-white text-sm block">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center mb-3 text-gray-300 dark:text-gray-600">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Cart is empty</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
              Tap any product on the left to add items to this sale.
            </p>
          </div>
        )}
      </div>

      {/* Cart Summary & Sticky Checkout Action */}
      <div className="p-4 bg-gray-50/80 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-700/70 space-y-3">
        
        {/* Discount Selector */}
        {items.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1 font-medium">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Apply Discount</span>
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{discountPercent}% OFF</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 5, 10, 15, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    discountPercent === pct
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calculation Lines */}
        <div className="space-y-1.5 pt-2 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount ({discountPercent}%)</span>
              <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span className="font-semibold text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <span className="text-base font-bold">Total Amount</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Primary Sticky "Complete Sale" Button */}
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className={`w-full h-13 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 ${
            items.length === 0
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'
          }`}
        >
          <span>Complete Sale (${grandTotal.toFixed(2)})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
