export interface Order {
  _id?: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderEvent {
  eventType: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_CANCELLED';
  orderId: string;
  order: Order;
  timestamp: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}