-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for customers table
CREATE INDEX idx_customers_customer_name ON customers(customer_name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_sort_order ON customers(sort_order);

-- Insert sample customers
INSERT INTO customers (customer_name, phone, address, city, sort_order) VALUES
('Khách Lẻ', '0909100000', '35/61 Nguyễn Thiện Thuật', 'Nha Trang', 1)
ON DUPLICATE KEY UPDATE customer_name = customer_name;

-- Add customer_id column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN customer_id INTEGER;
ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
