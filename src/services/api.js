import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from './mockData';

// Local storage keys for mock mode persistence
const MOCK_PRODS_KEY = 'pos_mock_products_v1';
const MOCK_CATS_KEY = 'pos_mock_categories_v1';
const MOCK_ORDERS_KEY = 'pos_mock_orders_v1';

const getMockData = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setMockData = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
};

// Initialize Mock Data if missing
if (!localStorage.getItem(MOCK_PRODS_KEY)) {
  setMockData(MOCK_PRODS_KEY, INITIAL_PRODUCTS);
}
if (!localStorage.getItem(MOCK_CATS_KEY)) {
  setMockData(MOCK_CATS_KEY, INITIAL_CATEGORIES);
}
if (!localStorage.getItem(MOCK_ORDERS_KEY)) {
  setMockData(MOCK_ORDERS_KEY, INITIAL_ORDERS);
}

const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const api = {
  // --- CATEGORIES ---
  async getCategories() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    }
    return getMockData(MOCK_CATS_KEY, INITIAL_CATEGORIES);
  },

  async addCategory(name) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').insert([{ name }]).select().single();
      if (error) throw error;
      return data;
    }
    const cats = getMockData(MOCK_CATS_KEY, INITIAL_CATEGORIES);
    const newCat = { id: `cat-${Date.now()}`, name };
    const updated = [...cats, newCat];
    setMockData(MOCK_CATS_KEY, updated);
    return newCat;
  },

  // --- PRODUCTS ---
  async getProducts() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data;
    }
    return getMockData(MOCK_PRODS_KEY, INITIAL_PRODUCTS);
  },

  async saveProduct(product) {
    if (isSupabaseConfigured) {
      const isUUID = product.id && isValidUUID(product.id);
      if (isUUID) {
        const { data, error } = await supabase.from('products').update(product).eq('id', product.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { id, ...newProd } = product;
        const { data, error } = await supabase.from('products').insert([newProd]).select().single();
        if (error) throw error;
        return data;
      }
    }
    
    const prods = getMockData(MOCK_PRODS_KEY, INITIAL_PRODUCTS);
    if (product.id) {
      const updated = prods.map(p => p.id === product.id ? { ...p, ...product } : p);
      setMockData(MOCK_PRODS_KEY, updated);
      return product;
    } else {
      const newProd = {
        ...product,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      const updated = [newProd, ...prods];
      setMockData(MOCK_PRODS_KEY, updated);
      return newProd;
    }
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured) {
      if (!isValidUUID(id)) return true;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const prods = getMockData(MOCK_PRODS_KEY, INITIAL_PRODUCTS);
    const updated = prods.filter(p => p.id !== id);
    setMockData(MOCK_PRODS_KEY, updated);
    return true;
  },

  // --- ORDERS & CHECKOUT (Atomic Transaction) ---
  async createOrder({ cashier, customerName, subtotal, discount, tax, total, paymentMethod, amountPaid, changeDue, items }) {
    if (isSupabaseConfigured) {
      const cashierId = (cashier?.id && isValidUUID(cashier.id)) ? cashier.id : null;

      // Execute Atomic Supabase RPC Function
      const { data, error } = await supabase.rpc('create_order_atomic', {
        p_cashier_id: cashierId,
        p_customer_name: customerName || 'Walk-in Customer',
        p_subtotal: subtotal,
        p_discount: discount,
        p_tax: tax,
        p_total: total,
        p_payment_method: paymentMethod,
        p_amount_paid: amountPaid,
        p_change_due: changeDue,
        p_items: items.map(item => ({
          product_id: (item.product?.id && isValidUUID(item.product.id)) ? item.product.id : null,
          product_name: item.product.name,
          qty: item.quantity,
          unit_price: item.product.price,
          subtotal: Number((item.product.price * item.quantity).toFixed(2))
        }))
      });

      if (error) throw error;
      return data;
    }

    // Mock Order Atomic Execution with Stock Decrement
    const prods = getMockData(MOCK_PRODS_KEY, INITIAL_PRODUCTS);
    
    // Check stock availability
    for (const item of items) {
      const targetProd = prods.find(p => p.id === item.product.id);
      if (!targetProd || targetProd.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for "${item.product.name}". Available: ${targetProd?.stock_qty || 0}`);
      }
    }

    // Decrement stock
    const updatedProds = prods.map(p => {
      const inCart = items.find(i => i.product.id === p.id);
      if (inCart) {
        return { ...p, stock_qty: p.stock_qty - inCart.quantity };
      }
      return p;
    });
    setMockData(MOCK_PRODS_KEY, updatedProds);

    // Create Order Record
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      cashier_name: cashier?.full_name || 'Staff Cashier',
      customer_name: customerName || 'Walk-in Customer',
      subtotal,
      discount,
      tax,
      total,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_due: changeDue,
      status: 'completed',
      created_at: new Date().toISOString(),
      items: items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        qty: item.quantity,
        unit_price: item.product.price,
        subtotal: Number((item.product.price * item.quantity).toFixed(2))
      }))
    };

    const orders = getMockData(MOCK_ORDERS_KEY, INITIAL_ORDERS);
    setMockData(MOCK_ORDERS_KEY, [newOrder, ...orders]);

    return { success: true, order_id: orderId, order: newOrder };
  },

  // --- ORDER HISTORY ---
  async getOrders() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return getMockData(MOCK_ORDERS_KEY, INITIAL_ORDERS);
  },

  // Reset Mock Data Helper
  resetMockData() {
    setMockData(MOCK_PRODS_KEY, INITIAL_PRODUCTS);
    setMockData(MOCK_CATS_KEY, INITIAL_CATEGORIES);
    setMockData(MOCK_ORDERS_KEY, INITIAL_ORDERS);
  }
};
