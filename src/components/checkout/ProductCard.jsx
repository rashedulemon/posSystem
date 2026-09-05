import React from 'react';
import { Plus, AlertTriangle, PackageX } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, inCartCount = 0 }) {
  const isOutOfStock = product.stock_qty <= 0;
  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 5;
  const isMaxInCart = inCartCount >= product.stock_qty;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 p-3.5 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden">
      
      {/* Product Image & Badges */}
      <div>
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-indigo-50 dark:from-gray-700 dark:to-gray-800 text-indigo-500 font-bold text-xl">
              {product.name.charAt(0)}
            </div>
          )}

          {/* Low Stock / Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-2">
              <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md">
                <PackageX className="w-3.5 h-3.5" />
                <span>Out of Stock</span>
              </span>
            </div>
          )}

          {!isOutOfStock && isLowStock && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                <span>Only {product.stock_qty} left</span>
              </span>
            </div>
          )}

          {/* Cart Quantity Badge */}
          {inCartCount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                {inCartCount}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-400 mb-1">
            <span className="font-mono">{product.sku}</span>
            <span>Stock: {product.stock_qty}</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Price & Touch-Friendly Add Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
        <div>
          <span className="text-xs text-gray-400 dark:text-gray-500 block leading-tight">Price</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock || isMaxInCart}
          className={`h-11 px-4 rounded-xl font-semibold text-sm flex items-center space-x-1.5 transition-all shadow-md active:scale-95 ${
            isOutOfStock || isMaxInCart
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
