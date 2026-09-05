import React, { useState, useMemo } from 'react';
import { Search, Filter, Scan, PackageX } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, categories, onAddToCart, cartItems }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart Count Map
  const cartMap = useMemo(() => {
    const map = {};
    cartItems.forEach(item => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cartItems]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Quick Barcode Scan Handler (pressing Enter in search field)
  const handleKeyDownSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const exactMatch = products.find(p => p.sku.toLowerCase() === searchQuery.trim().toLowerCase());
      if (exactMatch) {
        onAddToCart(exactMatch);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Category Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft space-y-3.5">
        
        {/* Instant Search Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDownSearch}
            placeholder="Search product by name or scan SKU / Barcode... (Press Enter)"
            className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="p-1 rounded-lg bg-gray-200/60 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-xs font-mono flex items-center space-x-1" title="Barcode Quick Scan Enabled">
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SKU</span>
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              inCartCount={cartMap[product.id] || 0}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 p-12 text-center shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <PackageX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No products found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or category filter to view available stock.
          </p>
        </div>
      )}
    </div>
  );
}
