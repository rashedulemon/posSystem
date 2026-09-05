-- ==========================================
-- POS SYSTEM SUPABASE DATABASE SCHEMA & RLS
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost NUMERIC(10, 2) DEFAULT 0 CHECK (cost >= 0),
    sku TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')) DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cashier_id UUID REFERENCES auth.users(id),
    customer_name TEXT DEFAULT 'Walk-in Customer',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10, 2) DEFAULT 0 CHECK (discount >= 0),
    tax NUMERIC(10, 2) DEFAULT 0 CHECK (tax >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'voided')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    change_due NUMERIC(10, 2) DEFAULT 0 CHECK (change_due >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop legacy restrictive policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can modify categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can read products" ON public.products;
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;
DROP POLICY IF EXISTS "Users can read profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can modify profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can select orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can select order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can select payments" ON public.payments;

-- Permissive Staff & Register RLS Policies
CREATE POLICY "Allow read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow write categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow write products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow read profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow write profiles" ON public.user_profiles FOR ALL USING (true);

CREATE POLICY "Allow read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow write orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow write order_items" ON public.order_items FOR ALL USING (true);

CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow write payments" ON public.payments FOR ALL USING (true);

-- ==========================================
-- ATOMIC ORDER TRANSACTION RPC FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_cashier_id UUID,
    p_customer_name TEXT,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_tax NUMERIC,
    p_total NUMERIC,
    p_payment_method TEXT,
    p_amount_paid NUMERIC,
    p_change_due NUMERIC,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_qty INT;
    v_unit_price NUMERIC;
    v_subtotal NUMERIC;
    v_product_name TEXT;
    v_curr_stock INT;
BEGIN
    -- 1. Create order record
    INSERT INTO public.orders (
        cashier_id, customer_name, subtotal, discount, tax, total, payment_method, status
    ) VALUES (
        p_cashier_id, COALESCE(p_customer_name, 'Walk-in Customer'), p_subtotal, p_discount, p_tax, p_total, p_payment_method, 'completed'
    )
    RETURNING id INTO v_order_id;

    -- 2. Create payment record
    INSERT INTO public.payments (order_id, method, amount, change_due)
    VALUES (v_order_id, p_payment_method, p_amount_paid, p_change_due);

    -- 3. Loop through order items, decrement stock, and insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'qty')::INT;
        v_unit_price := (v_item->>'unit_price')::NUMERIC;
        v_subtotal := (v_item->>'subtotal')::NUMERIC;
        v_product_name := (v_item->>'product_name')::TEXT;

        -- Check current stock
        SELECT stock_qty INTO v_curr_stock FROM public.products WHERE id = v_product_id FOR UPDATE;
        IF v_curr_stock < v_qty THEN
            RAISE EXCEPTION 'Insufficient stock for product % (Available: %, Requested: %)', v_product_name, v_curr_stock, v_qty;
        END IF;

        -- Decrement stock
        UPDATE public.products
        SET stock_qty = stock_qty - v_qty
        WHERE id = v_product_id;

        -- Insert order item
        INSERT INTO public.order_items (order_id, product_id, product_name, qty, unit_price, subtotal)
        VALUES (v_order_id, v_product_id, v_product_name, v_qty, v_unit_price, v_subtotal);
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id
    );
END;
$$;

-- Initial Seed Categories & Products (Optional)
INSERT INTO public.categories (name) VALUES 
('Beverages'), ('Bakery'), ('Snacks'), ('Electronics'), ('Apparel')
ON CONFLICT DO NOTHING;
