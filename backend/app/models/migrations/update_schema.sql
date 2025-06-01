-- Add image_url to categories and products
ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE products ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;

-- Update is_active columns to TINYINT(1)
ALTER TABLE users MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE categories MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE products MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;

-- Update timestamp columns
ALTER TABLE users 
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE categories 
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE products 
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE orders 
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE order_items 
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add product info columns to order_items
ALTER TABLE order_items 
    ADD COLUMN product_name VARCHAR(100) NOT NULL AFTER product_id,
    ADD COLUMN unit_price DECIMAL(10,2) NOT NULL AFTER product_name;

-- Add indexes for frequently queried columns
-- Users table indexes
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Categories table indexes
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_name ON categories(name);

-- Products table indexes
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);

-- Orders table indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items table indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- System config table indexes
CREATE INDEX idx_system_config_key ON system_config(key); 