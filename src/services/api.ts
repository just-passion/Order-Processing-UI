import axios from 'axios';
import { Order, CreateOrderRequest, ApiResponse, OrderStatus } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create order');
    }
    return response.data.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
    return response.data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch order');
    }
    return response.data.data;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order status');
    }
    return response.data.data;
  },

  async sendWebhook(eventData: any): Promise<void> {
    const response = await apiClient.post<ApiResponse<any>>('/orders/webhook', eventData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send webhook');
    }
  }
};