-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE trackchain_db;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'producer', 'seller', 'distributor', 'user')),
    wallet_address VARCHAR(42) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Tabla de productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    producer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    origin VARCHAR(255),
    production_date DATE,
    blockchain_hash VARCHAR(66),
    metadata_hash VARCHAR(64),
    current_custody_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para productos
CREATE INDEX idx_products_producer_id ON products(producer_id);
CREATE INDEX idx_products_current_custody_id ON products(current_custody_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_blockchain_hash ON products(blockchain_hash);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_production_date ON products(production_date);

-- Tabla de certificaciones de productos
CREATE TABLE product_certifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    certification_body VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_hash VARCHAR(64),
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para certificaciones
CREATE INDEX idx_product_certifications_product_id ON product_certifications(product_id);
CREATE INDEX idx_product_certifications_name ON product_certifications(certification_name);
CREATE INDEX idx_product_certifications_is_valid ON product_certifications(is_valid);

-- Tabla de historial de productos (trazabilidad)
CREATE TABLE product_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    blockchain_hash VARCHAR(66)
);

-- Crear índices para historial
CREATE INDEX idx_product_history_product_id ON product_history(product_id);
CREATE INDEX idx_product_history_actor_id ON product_history(actor_id);
CREATE INDEX idx_product_history_action ON product_history(action);
CREATE INDEX idx_product_history_timestamp ON product_history(timestamp);
CREATE INDEX idx_product_history_blockchain_hash ON product_history(blockchain_hash);

-- Tabla de transacciones de venta
CREATE TABLE sale_transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    location VARCHAR(255),
    notes TEXT,
    blockchain_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para transacciones
CREATE INDEX idx_sale_transactions_product_id ON sale_transactions(product_id);
CREATE INDEX idx_sale_transactions_seller_id ON sale_transactions(seller_id);
CREATE INDEX idx_sale_transactions_buyer_id ON sale_transactions(buyer_id);
CREATE INDEX idx_sale_transactions_status ON sale_transactions(status);
CREATE INDEX idx_sale_transactions_blockchain_hash ON sale_transactions(blockchain_hash);
CREATE INDEX idx_sale_transactions_created_at ON sale_transactions(created_at);

-- Tabla de envíos (para distribuidores)
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    distributor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    transport_company VARCHAR(255),
    quantity DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_transit' CHECK (status IN ('in_transit', 'delivered', 'cancelled')),
    notes TEXT,
    blockchain_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para envíos
CREATE INDEX idx_shipments_product_id ON shipments(product_id);
CREATE INDEX idx_shipments_distributor_id ON shipments(distributor_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_blockchain_hash ON shipments(blockchain_hash);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);

-- Tabla de transferencias de productos
CREATE TABLE product_transfers (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
    notes TEXT,
    blockchain_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para transferencias
CREATE INDEX idx_product_transfers_product_id ON product_transfers(product_id);
CREATE INDEX idx_product_transfers_from_user_id ON product_transfers(from_user_id);
CREATE INDEX idx_product_transfers_to_user_id ON product_transfers(to_user_id);
CREATE INDEX idx_product_transfers_status ON product_transfers(status);
CREATE INDEX idx_product_transfers_blockchain_hash ON product_transfers(blockchain_hash);
CREATE INDEX idx_product_transfers_created_at ON product_transfers(created_at);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para configuración
CREATE INDEX idx_system_config_key ON system_config(config_key);
CREATE INDEX idx_system_config_is_active ON system_config(is_active);

-- Tabla de logs del sistema
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para logs
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_entity_type ON system_logs(entity_type);
CREATE INDEX idx_system_logs_entity_id ON system_logs(entity_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Tabla de sesiones de usuario
CREATE TABLE user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para sesiones
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sale_transactions_updated_at BEFORE UPDATE ON sale_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_transfers_updated_at BEFORE UPDATE ON product_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración inicial del sistema
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

-- Insertar usuarios de prueba para login (con contraseñas hasheadas)
-- Contraseña para todos los usuarios: admin123, productor123, vendedor123, distribuidor123, usuario123
-- Hash generado con bcrypt para todas las contraseñas: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (name, email, password_hash, role, wallet_address) VALUES
('Admin Principal', 'admin@trackchain.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4'),
('Juan Productor', 'productor@trackchain.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'producer', '0x8ba1f109551bD432803012645Hac136c0532925a'),
('María Vendedora', 'vendedor@trackchain.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', '0x1234567890123456789012345678901234567890'),
('Carlos Distribuidor', 'distribuidor@trackchain.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'distributor', '0x0987654321098765432109876543210987654321'),
('Ana Usuario', 'usuario@trackchain.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', '0x1111222233334444555566667777888899990000');

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
GROUP BY p.id, u.name, u.email, custody.name;

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
