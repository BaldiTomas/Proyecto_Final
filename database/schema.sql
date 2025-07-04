-- Crear base de datos
CREATE DATABASE IF NOT EXISTS trackchain_db;
USE trackchain_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'producer', 'seller', 'distributor', 'user') NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Tabla de productos
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    producer_id INT NOT NULL,
    origin VARCHAR(255),
    production_date DATE,
    blockchain_hash VARCHAR(66), -- Hash de la transacción en blockchain
    metadata_hash VARCHAR(64), -- Hash IPFS para metadatos adicionales
    current_custody_id INT, -- Usuario que tiene custodia actual
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_custody_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_producer_id (producer_id),
    INDEX idx_current_custody_id (current_custody_id),
    INDEX idx_category (category),
    INDEX idx_blockchain_hash (blockchain_hash),
    INDEX idx_is_active (is_active),
    INDEX idx_production_date (production_date)
);

-- Tabla de certificaciones de productos
CREATE TABLE product_certifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    certification_body VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_hash VARCHAR(64), -- Hash del certificado
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_certification_name (certification_name),
    INDEX idx_is_valid (is_valid)
);

-- Tabla de historial de productos (trazabilidad)
CREATE TABLE product_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    actor_id INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- created, transferred, verified, updated, shipped, delivered, etc.
    location VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    blockchain_hash VARCHAR(66), -- Hash de la transacción en blockchain
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_actor_id (actor_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp),
    INDEX idx_blockchain_hash (blockchain_hash)
);

-- Tabla de transacciones de venta
CREATE TABLE sale_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    buyer_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    location VARCHAR(255),
    notes TEXT,
    blockchain_hash VARCHAR(66), -- Hash de la transacción en blockchain
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_status (status),
    INDEX idx_blockchain_hash (blockchain_hash),
    INDEX idx_created_at (created_at)
);

-- Tabla de envíos (para distribuidores)
CREATE TABLE shipments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    distributor_id INT NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    transport_company VARCHAR(255),
    quantity DECIMAL(10,2) NOT NULL,
    status ENUM('in_transit', 'delivered', 'cancelled') DEFAULT 'in_transit',
    notes TEXT,
    blockchain_hash VARCHAR(66), -- Hash de la transacción en blockchain
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_distributor_id (distributor_id),
    INDEX idx_status (status),
    INDEX idx_blockchain_hash (blockchain_hash),
    INDEX idx_created_at (created_at)
);

-- Tabla de transferencias de productos
CREATE TABLE product_transfers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
    notes TEXT,
    blockchain_hash VARCHAR(66), -- Hash de la transacción en blockchain
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_from_user_id (from_user_id),
    INDEX idx_to_user_id (to_user_id),
    INDEX idx_status (status),
    INDEX idx_blockchain_hash (blockchain_hash),
    INDEX idx_created_at (created_at)
);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key),
    INDEX idx_is_active (is_active)
);

-- Tabla de logs del sistema
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- user, product, transaction, shipment, transfer, etc.
    entity_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_created_at (created_at)
);

-- Tabla de sesiones de usuario
CREATE TABLE user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Insertar datos de configuración inicial
INSERT INTO system_config (config_key, config_value, description) VALUES
('blockchain_network', 'ethereum', 'Red blockchain principal'),
('contract_user_registration', '', 'Dirección del contrato de registro de usuarios'),
('contract_product_registration', '', 'Dirección del contrato de registro de productos'),
('contract_sale_transaction', '', 'Dirección del contrato de transacciones de venta'),
('contract_shipment_registration', '', 'Dirección del contrato de registro de envíos'),
('contract_product_transfer', '', 'Dirección del contrato de transferencia de productos'),
('ipfs_gateway', 'https://ipfs.io/ipfs/', 'Gateway IPFS para metadatos'),
('max_file_size', '10485760', 'Tamaño máximo de archivo en bytes (10MB)'),
('supported_file_types', 'jpg,jpeg,png,pdf,doc,docx', 'Tipos de archivo soportados'),
('email_notifications', 'true', 'Habilitar notificaciones por email'),
('blockchain_confirmations', '3', 'Número de confirmaciones requeridas');

-- Insertar usuario administrador por defecto
INSERT INTO users (name, email, password_hash, role, wallet_address) VALUES
('Administrador Principal', 'admin@trackchain.com', '$2b$10$example_hash_here', 'admin', '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4');

-- Crear vistas útiles
CREATE VIEW active_products AS
SELECT 
    p.*,
    u.name as producer_name,
    u.email as producer_email,
    custody.name as custody_name,
    COUNT(ph.id) as history_count
FROM products p
JOIN users u ON p.producer_id = u.id
LEFT JOIN users custody ON p.current_custody_id = custody.id
LEFT JOIN product_history ph ON p.id = ph.product_id
WHERE p.is_active = TRUE
GROUP BY p.id;

CREATE VIEW transaction_summary AS
SELECT 
    st.*,
    p.name as product_name,
    seller.name as seller_name,
    buyer.name as buyer_name
FROM sale_transactions st
JOIN products p ON st.product_id = p.id
JOIN users seller ON st.seller_id = seller.id
JOIN users buyer ON st.buyer_id = buyer.id;

CREATE VIEW shipment_summary AS
SELECT 
    s.*,
    p.name as product_name,
    d.name as distributor_name
FROM shipments s
JOIN products p ON s.product_id = p.id
JOIN users d ON s.distributor_id = d.id;

CREATE VIEW transfer_summary AS
SELECT 
    pt.*,
    p.name as product_name,
    from_user.name as from_user_name,
    to_user.name as to_user_name
FROM product_transfers pt
JOIN products p ON pt.product_id = p.id
JOIN users from_user ON pt.from_user_id = from_user.id
JOIN users to_user ON pt.to_user_id = to_user.id;

-- Crear procedimientos almacenados útiles
DELIMITER //

CREATE PROCEDURE GetProductTraceability(IN product_id INT)
BEGIN
    SELECT 
        ph.*,
        u.name as actor_name,
        u.role as actor_role
    FROM product_history ph
    JOIN users u ON ph.actor_id = u.id
    WHERE ph.product_id = product_id
    ORDER BY ph.timestamp ASC;
END //

CREATE PROCEDURE GetUserStatistics(IN user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM products WHERE producer_id = user_id AND is_active = TRUE) as active_products,
        (SELECT COUNT(*) FROM sale_transactions WHERE seller_id = user_id) as sales_count,
        (SELECT COUNT(*) FROM sale_transactions WHERE buyer_id = user_id) as purchases_count,
        (SELECT COUNT(*) FROM shipments WHERE distributor_id = user_id) as shipments_count,
        (SELECT COUNT(*) FROM product_transfers WHERE from_user_id = user_id OR to_user_id = user_id) as transfers_count,
        (SELECT SUM(total_amount) FROM sale_transactions WHERE seller_id = user_id AND status = 'delivered') as total_sales_amount;
END //

CREATE PROCEDURE GetDistributorDashboard(IN distributor_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM shipments WHERE distributor_id = distributor_id AND status = 'in_transit') as active_shipments,
        (SELECT COUNT(*) FROM shipments WHERE distributor_id = distributor_id AND status = 'delivered') as completed_shipments,
        (SELECT COUNT(*) FROM product_transfers WHERE from_user_id = distributor_id AND status = 'pending') as pending_transfers,
        (SELECT COUNT(*) FROM products WHERE current_custody_id = distributor_id) as products_in_custody;
END //

DELIMITER ;
