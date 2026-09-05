import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit3, Trash2, AlertTriangle, ShieldAlert, Loader2, FolderPlus } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductModal from '../components/products/ProductModal';
import CategoryModal from '../components/products/CategoryModal';

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      await api.saveProduct(productData);
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      loadData();
    } catch (err) {
      alert(`Failed to save product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      loadData();
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  const handleAddCategory = async (name) => {
    try {
      await api.addCategory(name);
      loadData();
    } catch (err) {
      alert(`Failed to add category: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'all' || p.category_id === selectedCat;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Uncategorized';
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-3 text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-semibold text-sm">Loading Product Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Inventory & Products</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage product catalog, prices, stock levels, and SKUs.
          </p>
        </div>

        {/* Actions (Admin restricted notice if cashier) */}
        {isAdmin ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1.5"
            >
              <FolderPlus className="w-4 h-4 text-indigo-500" />
              <span>Add Category</span>
            </button>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center space-x-1.5 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Admin permissions required to modify stock</span>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === c.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table View */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold border-b border-gray-100 dark:border-gray-700">
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Cost Price</th>
                <th className="py-3.5 px-4">Stock Qty</th>
                {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => {
                  const isLow = p.stock_qty <= 5;
                  const margin = p.price && p.cost ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-700" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-gray-700 text-indigo-600 font-bold flex items-center justify-center">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</p>
                            {margin > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                {margin}% profit margin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500 dark:text-gray-400">{p.sku}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
                        {getCategoryName(p.category_id)}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        ${Number(p.cost || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          p.stock_qty <= 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          <span>{p.stock_qty} units</span>
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-gray-400">
                    No products match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Add Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        product={selectedProduct}
        categories={categories}
      />

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
