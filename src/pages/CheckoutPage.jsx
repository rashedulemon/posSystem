import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductGrid from '../components/checkout/ProductGrid';
import CartPanel from '../components/checkout/CartPanel';
import PaymentModal from '../components/checkout/PaymentModal';
import ReceiptModal from '../components/checkout/ReceiptModal';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, addToCart, clearCart, subtotal, discountAmount, taxAmount, grandTotal, customerName } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mobile active tab ('products' | 'cart')
  const [mobileTab, setMobileTab] = useState('products');

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

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
      console.error('Failed to load POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async ({ paymentMethod, amountPaid, changeDue }) => {
    try {
      const orderPayload = {
        cashier: user,
        customerName: customerName.trim() || 'Walk-in Customer',
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discountAmount.toFixed(2)),
        tax: Number(taxAmount.toFixed(2)),
        total: Number(grandTotal.toFixed(2)),
        paymentMethod,
        amountPaid,
        changeDue,
        items
      };

      const res = await api.createOrder(orderPayload);
      
      const fullOrderData = res.order || {
        id: res.order_id,
        cashier_name: user?.full_name || 'Staff',
        customer_name: customerName || 'Walk-in Customer',
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        change_due: changeDue,
        created_at: new Date().toISOString(),
        items: items.map(i => ({
          product_name: i.product.name,
          qty: i.quantity,
          subtotal: i.product.price * i.quantity
        }))
      };

      setCompletedOrder(fullOrderData);
      setIsPaymentOpen(false);
      setIsReceiptOpen(true);

      // Refresh product stock list after sale
      loadData();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert(`Checkout failed: ${err.message}`);
    }
  };

  const handleNewSale = () => {
    clearCart();
    setMobileTab('products');
    setCompletedOrder(null);
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-3 text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-semibold text-sm">Loading POS Register...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700/70 shadow-soft">
        <button
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            mobileTab === 'products'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Products ({products.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            mobileTab === 'cart'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>View Cart ({items.length}) - ${grandTotal.toFixed(2)}</span>
        </button>
      </div>

      {/* Main Dual-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Grid */}
        <div className={`lg:col-span-7 xl:col-span-8 ${mobileTab === 'cart' ? 'hidden lg:block' : 'block'}`}>
          <ProductGrid
            products={products}
            categories={categories}
            onAddToCart={addToCart}
            cartItems={items}
          />
        </div>

        {/* Right Column: Fixed Cart & Checkout Panel */}
        <div className={`lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] ${mobileTab === 'products' ? 'hidden lg:block' : 'block'}`}>
          <CartPanel onCheckout={() => setIsPaymentOpen(true)} />
        </div>
      </div>

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* On-Screen Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        orderData={completedOrder}
        onNewSale={handleNewSale}
      />
    </div>
  );
}
