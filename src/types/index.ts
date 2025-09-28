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

// types.ts
export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

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