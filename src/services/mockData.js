// High quality initial mock data for immediate testing out of the box

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Coffee & Drinks' },
  { id: 'cat-2', name: 'Fresh Bakery' },
  { id: 'cat-3', name: 'Breakfast & Lunch' },
  { id: 'cat-4', name: 'Snacks & Sweets' },
  { id: 'cat-5', name: 'Merchandise' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Iced Artisan Latte',
    price: 4.50,
    cost: 1.20,
    sku: 'DRK-001',
    category_id: 'cat-1',
    stock_qty: 45,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-2',
    name: 'Double Espresso',
    price: 3.20,
    cost: 0.80,
    sku: 'DRK-002',
    category_id: 'cat-1',
    stock_qty: 80,
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-3',
    name: 'Matcha Green Tea Latte',
    price: 5.00,
    cost: 1.50,
    sku: 'DRK-003',
    category_id: 'cat-1',
    stock_qty: 3, // Low stock for testing badges
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-4',
    name: 'Butter Croissant',
    price: 3.80,
    cost: 0.90,
    sku: 'BAK-001',
    category_id: 'cat-2',
    stock_qty: 24,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-5',
    name: 'Chocolate Chip Muffin',
    price: 3.50,
    cost: 0.85,
    sku: 'BAK-002',
    category_id: 'cat-2',
    stock_qty: 18,
    image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-6',
    name: 'Avocado Sourdough Toast',
    price: 8.90,
    cost: 2.40,
    sku: 'FOD-001',
    category_id: 'cat-3',
    stock_qty: 12,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-7',
    name: 'Grilled Chicken Panini',
    price: 9.50,
    cost: 3.10,
    sku: 'FOD-002',
    category_id: 'cat-3',
    stock_qty: 2, // Low stock
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-8',
    name: 'Organic Granola Bar',
    price: 2.50,
    cost: 0.60,
    sku: 'SNK-001',
    category_id: 'cat-4',
    stock_qty: 50,
    image_url: 'https://images.unsplash.com/photo-1622484210800-8851b576f9d2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-9',
    name: 'Ceramic POS Coffee Tumbler',
    price: 18.00,
    cost: 6.50,
    sku: 'MER-001',
    category_id: 'cat-5',
    stock_qty: 15,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-9821',
    cashier_name: 'Alex Morgan (Admin)',
    customer_name: 'Sarah Jenkins',
    subtotal: 13.30,
    discount: 1.00,
    tax: 0.98,
    total: 13.28,
    payment_method: 'card',
    amount_paid: 13.28,
    change_due: 0.00,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    items: [
      { product_id: 'prod-1', product_name: 'Iced Artisan Latte', qty: 2, unit_price: 4.50, subtotal: 9.00 },
      { product_id: 'prod-4', product_name: 'Butter Croissant', qty: 1, unit_price: 3.80, subtotal: 3.80 },
      { product_id: 'prod-8', product_name: 'Organic Granola Bar', qty: 1, unit_price: 2.50, subtotal: 2.50 },
    ]
  },
  {
    id: 'ORD-9820',
    cashier_name: 'David Miller (Cashier)',
    customer_name: 'Walk-in Customer',
    subtotal: 8.90,
    discount: 0.00,
    tax: 0.71,
    total: 9.61,
    payment_method: 'cash',
    amount_paid: 20.00,
    change_due: 10.39,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hrs ago
    items: [
      { product_id: 'prod-6', product_name: 'Avocado Sourdough Toast', qty: 1, unit_price: 8.90, subtotal: 8.90 }
    ]
  },
  {
    id: 'ORD-9819',
    cashier_name: 'Alex Morgan (Admin)',
    customer_name: 'Walk-in Customer',
    subtotal: 23.00,
    discount: 2.00,
    tax: 1.68,
    total: 22.68,
    payment_method: 'mobile',
    amount_paid: 22.68,
    change_due: 0.00,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hrs ago
    items: [
      { product_id: 'prod-9', product_name: 'Ceramic POS Coffee Tumbler', qty: 1, unit_price: 18.00, subtotal: 18.00 },
      { product_id: 'prod-3', product_name: 'Matcha Green Tea Latte', qty: 1, unit_price: 5.00, subtotal: 5.00 }
    ]
  }
];

export const DEMO_USERS = {
  admin: {
    id: 'usr-admin-1',
    email: 'admin@pos.shop',
    full_name: 'Alex Morgan',
    role: 'admin',
  },
  cashier: {
    id: 'usr-cashier-1',
    email: 'cashier@pos.shop',
    full_name: 'David Miller',
    role: 'cashier',
  }
};
