-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    payment_method_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for payment_methods
CREATE INDEX idx_payment_methods_payment_method_code ON payment_methods(payment_method_code);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX idx_payment_methods_name ON payment_methods(name);

-- Insert default payment methods
INSERT INTO payment_methods (payment_method_code, name, description) VALUES
('CASH', 'Cash', 'Payment with cash'),
('BANK_TRANSFER', 'Bank Transfer', 'Payment via bank transfer')
ON DUPLICATE KEY UPDATE name = name;

-- Add payment_method_code column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN payment_method_code VARCHAR(20);
ALTER TABLE orders ADD CONSTRAINT fk_orders_payment_method FOREIGN KEY (payment_method_code) REFERENCES payment_methods(payment_method_code);
CREATE INDEX idx_orders_payment_method_code ON orders(payment_method_code);

-- Remove old payment_method_id column if it exists
ALTER TABLE orders DROP COLUMN payment_method_id;
