export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  wallet_address?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string; 
  producer_id?: number;
  producer_name?: string;
  origin: string;
  production_date?: string;
  blockchain_hash?: string | null;
  metadata_hash?: string | null;
  current_custody_id?: number | null;
  custody_user_id?: number;
  stock: number;
  is_active?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  price?: number | string;
  shipment_status?: "in_transit" | "delivered" | "cancelled" | "pending" | string;
}

export interface ProductWithProducer extends Product {
  producer_name: string;
}

export type Transaction = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  total_amount: number;
  buyer_name: string;
  seller_name: string;
  status: string;
  created_at: string;
};

export interface Shipment {
  id: number;
  product_id: number;
  product_name: string;
  producer_name: string; 
  origin: string;
  destination: string;
  transport_company: string;
  quantity: number;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  notes: string;
  blockchain_hash: string | null;
  created_at: string;
}

export interface NewShipmentData {
  productId: number;
  origin: string;
  destination: string;
  transportCompany: string;
  quantity: number;
  notes?: string;
  transactionId?: number;
}

export type ShipmentStatus = "pending" | "in_transit" | "delivered" | "cancelled";

export interface Transfer {
  id: number;
  product_id: number;
  product_name: string;
  from_user_id: number;
  from_user_name: string;
  to_user_id: number;
  to_user_name: string;
  quantity: number;
  status: "pending" | "completed" | "rejected";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewTransferData {
  productId: number;
  toUserId: number;
  quantity: number;
  notes?: string;
  fromUserId?: number;
}

export interface BuyProductData {
  productId: number;
  fromProducerId: number;
  quantity: number;
  purchasePrice: number;
  toSellerId: number;
  notes?: string;
}

export interface SellProductData {
  productId: number;
  buyerId: number;
  quantity: number;
  pricePerUnit: number;
  currency?: string;
  location?: string;
  notes?: string;
  blockchainHash?: string;
}

export interface SaleTransaction {
  id: number;
  product_id: number;
  product_name?: string;
  seller_id: number;
  seller_name?: string;
  buyer_id: number;
  buyer_name?: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  currency: string;
  status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
  location: string | null;
  notes: string | null;
  blockchain_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductHistory {
  id: number;
  product_id: number;
  actor_id: number;
  action: string;
  location: string | null;
  timestamp: string;
  notes: string | null;
  blockchain_hash: string | null;
}
