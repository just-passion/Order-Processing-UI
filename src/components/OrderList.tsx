import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { OrderStatus, type Order } from '../types';
import { api } from '../services/api';

interface OrderListProps {
  orders: Order[];
  onRefresh: () => void;
}
function OrderList({ orders, onRefresh }: OrderListProps) {
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  const getStatusColor = (status: OrderStatus): string => {
    const statusColors = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.PROCESSING]: 'status-processing',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
    };
    return statusColors[status] || 'status-pending';
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (updatingOrders.has(orderId)) return;

    try {
      setUpdatingOrders(prev => new Set([...prev, orderId]));
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      onRefresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrders(prev => {
        const updated = new Set(prev);
        updated.delete(orderId);
        return updated;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow = {
      [OrderStatus.PENDING]: OrderStatus.PROCESSING,
      [OrderStatus.PROCESSING]: OrderStatus.CONFIRMED,
      [OrderStatus.CONFIRMED]: OrderStatus.SHIPPED,
      [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
      [OrderStatus.DELIVERED]: null,
      [OrderStatus.CANCELLED]: null,
    };
    return statusFlow[currentStatus];
  };

  if (orders.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h3>No orders yet</h3>
          <p>Create your first order using the form on the left.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>Orders ({orders.length})</h2>
        <button
          onClick={onRefresh}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {orders.map((order) => (
          <div
            key={order.orderId}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              backgroundColor: '#fafafa'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  Order #{order.orderId.slice(0, 8)}
                </h4>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                  <strong>Customer:</strong> {order.customerName}
                </p>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                  <strong>Email:</strong> {order.customerEmail}
                </p>
                {order.createdAt && (
                  <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>
                    Created: {formatDate(order.createdAt)}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`status-badge ${getStatusColor(order.status)}`} style={{ marginBottom: '8px' }}>
                  {order.status}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  ${order.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: '#555' }}>Items:</h5>
              <div style={{ backgroundColor: '#fff', borderRadius: '6px', padding: '12px' }}>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', color: '#333' }}>{item.productName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>ID: {item.productId}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{item.quantity} × ${item.price.toFixed(2)}</div>
                      <div style={{ fontWeight: 'bold' }}>${(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {getNextStatus(order.status) && (
                <button
                  onClick={() => handleStatusUpdate(order.orderId, getNextStatus(order.status)!)}
                  disabled={updatingOrders.has(order.orderId)}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {updatingOrders.has(order.orderId)
                    ? 'Updating...'
                    : `Mark as ${getNextStatus(order.status)}`
                  }
                </button>
              )}
              
              {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                <button
                  onClick={() => handleStatusUpdate(order.orderId, OrderStatus.CANCELLED)}
                  disabled={updatingOrders.has(order.orderId)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', backgroundColor: '#dc3545' }}
                >
                  {updatingOrders.has(order.orderId) ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;