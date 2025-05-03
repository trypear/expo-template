-- Custom SQL migration file with mock data for store sales tracking app

-- Insert mock categories
INSERT INTO "category" ("id", "name", "description") VALUES
('11111111-1111-1111-1111-111111111111', 'Electronics', 'Electronic devices and accessories'),
('22222222-2222-2222-2222-222222222222', 'Clothing', 'Apparel and fashion items'),
('33333333-3333-3333-3333-333333333333', 'Groceries', 'Food and household items'),
('44444444-4444-4444-4444-444444444444', 'Books', 'Books, magazines, and publications'),
('55555555-5555-5555-5555-555555555555', 'Home & Garden', 'Home improvement and garden supplies');

-- Insert mock products
INSERT INTO "product" ("id", "name", "description", "sku", "price", "category_id", "is_active") VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Smartphone X', 'Latest smartphone with advanced features', 'PHONE-001', 79999, '11111111-1111-1111-1111-111111111111', true),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Laptop Pro', 'High-performance laptop for professionals', 'LAPTOP-001', 129999, '11111111-1111-1111-1111-111111111111', true),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'T-shirt Basic', 'Cotton basic t-shirt', 'TSHIRT-001', 1999, '22222222-2222-2222-2222-222222222222', true),
('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'Jeans Classic', 'Classic fit jeans', 'JEANS-001', 4999, '22222222-2222-2222-2222-222222222222', true),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'Organic Apples', 'Fresh organic apples (1kg)', 'APPLE-001', 499, '33333333-3333-3333-3333-333333333333', true),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'Bread', 'Freshly baked bread', 'BREAD-001', 299, '33333333-3333-3333-3333-333333333333', true),
('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'Bestseller Novel', 'Popular fiction novel', 'BOOK-001', 1499, '44444444-4444-4444-4444-444444444444', true),
('b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8', 'Garden Tools Set', 'Complete set of garden tools', 'GARDEN-001', 5999, '55555555-5555-5555-5555-555555555555', true),
('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'Headphones', 'Wireless noise-cancelling headphones', 'AUDIO-001', 24999, '11111111-1111-1111-1111-111111111111', true),
('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Coffee Maker', 'Automatic coffee maker', 'COFFEE-001', 8999, '55555555-5555-5555-5555-555555555555', true);

-- Insert mock users (if not already present)
INSERT INTO "user" ("id", "name", "email", "user_role")
VALUES 
('abcdef12-3456-7890-abcd-ef1234567890', 'John Doe', 'john@example.com', 'user'),
('bcdef123-4567-890a-bcde-f1234567890a', 'Jane Smith', 'jane@example.com', 'admin')
ON CONFLICT (lower("email")) DO NOTHING;

-- Insert additional users for our customers
INSERT INTO "user" ("id", "name", "email", "user_role")
VALUES
('cdef1234-5678-90ab-cdef-123456789012', 'Bob Johnson', 'bob@example.com', 'user'),
('def12345-6789-0abc-def1-234567890123', 'Alice Brown', 'alice@example.com', 'user'),
('ef123456-7890-abcd-ef12-345678901234', 'Charlie Davis', 'charlie@example.com', 'user')
ON CONFLICT (lower("email")) DO NOTHING;

-- Insert mock customers
INSERT INTO "customer" ("id", "name", "email", "phone", "address", "user_id") VALUES
('12345678-1234-5678-1234-567812345678', 'John Doe', 'john@example.com', '555-123-4567', '123 Main St, Anytown, AN 12345', 'abcdef12-3456-7890-abcd-ef1234567890'),
('23456789-2345-6789-2345-678923456789', 'Jane Smith', 'jane@example.com', '555-234-5678', '456 Oak Ave, Somewhere, SO 67890', 'bcdef123-4567-890a-bcde-f1234567890a'),
('34567890-3456-7890-3456-789034567890', 'Bob Johnson', 'bob@example.com', '555-345-6789', '789 Pine Rd, Nowhere, NO 34567', 'cdef1234-5678-90ab-cdef-123456789012'),
('45678901-4567-8901-4567-890145678901', 'Alice Brown', 'alice@example.com', '555-456-7890', '321 Elm St, Elsewhere, EL 45678', 'def12345-6789-0abc-def1-234567890123'),
('56789012-5678-9012-5678-901256789012', 'Charlie Davis', 'charlie@example.com', '555-567-8901', '654 Maple Dr, Anywhere, AN 56789', 'ef123456-7890-abcd-ef12-345678901234');

-- Insert mock inventory
INSERT INTO "inventory" ("id", "product_id", "quantity", "last_restock_date", "location_code") VALUES
('aa111111-bb22-cc33-dd44-eeeeffffffff', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 25, '2025-02-15', 'main'),
('bb222222-cc33-dd44-ee55-ffffaaaaaaaa', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 10, '2025-02-20', 'main'),
('cc333333-dd44-ee55-ff66-aaaabbbbcccc', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 100, '2025-02-25', 'main'),
('dd444444-ee55-ff66-aa77-bbbbccccdddd', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 50, '2025-02-28', 'main'),
('ee555555-ff66-aa77-bb88-ccccddddeeee', 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 75, '2025-03-01', 'main'),
('ff666666-aa77-bb88-cc99-ddddeeeeaaaa', 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 30, '2025-03-01', 'main'),
('aa777777-bb88-cc99-dd00-eeeeffffbbbb', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 40, '2025-02-10', 'main'),
('bb888888-cc99-dd00-ee11-ffffaaaacccc', 'b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8', 15, '2025-02-05', 'main'),
('cc999999-dd00-ee11-ff22-aaaabbbbdddd', 'c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 20, '2025-02-18', 'main'),
('dd000000-ee11-ff22-aa33-bbbbcccceeee', 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 12, '2025-02-22', 'main');

-- Insert mock sales
INSERT INTO "sale" ("id", "customer_id", "sale_date", "total_amount", "payment_method", "status", "notes") VALUES
('a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', '12345678-1234-5678-1234-567812345678', '2025-03-01 10:30:00+00', 82997, 'credit_card', 'completed', 'Regular customer purchase'),
('b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', '23456789-2345-6789-2345-678923456789', '2025-03-02 14:45:00+00', 129999, 'credit_card', 'completed', 'Business purchase'),
('c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', '34567890-3456-7890-3456-789034567890', '2025-03-03 09:15:00+00', 6998, 'cash', 'completed', NULL),
('d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', '45678901-4567-8901-4567-890145678901', '2025-03-04 16:20:00+00', 24999, 'mobile_payment', 'completed', NULL),
('e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', '56789012-5678-9012-5678-901256789012', '2025-03-05 11:10:00+00', 9298, 'debit_card', 'completed', 'First-time customer');

-- Insert mock sale items
INSERT INTO "sale_item" ("id", "sale_id", "product_id", "quantity", "price_at_sale", "discount") VALUES
('f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1', 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 1, 79999, 0),
('a7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2', 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 6, 499, 0),
('b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3', 'b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 1, 129999, 0),
('c9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4', 'c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 2, 1999, 0),
('d0e1f2a3-b4c5-d6e7-f8a9-b0c1d2e3f4a5', 'c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 10, 299, 0),
('e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6', 'd4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', 'c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 1, 24999, 0),
('f2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7', 'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 1, 8999, 0),
('a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8', 'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 1, 1499, 1200); -- With discount