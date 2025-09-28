import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import { useWebSocket } from './hooks/useWebSocket';
import { Order } from './types';
import { api } from './services/api';
import './App.css';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useWebSocket({
    onOrderUpdate: (orderEvent) => {
      // Update the order in the list
      setOrders(prevOrders => {
        const existingIndex = prevOrders.findIndex(o => o.orderId === orderEvent.orderId);
        if (existingIndex >= 0) {
          const updatedOrders = [...prevOrders];
          updatedOrders[existingIndex] = orderEvent.order;
          return updatedOrders;
        } else {
          // New order, add to the beginning
          return [orderEvent.order, ...prevOrders];
        }
      });
    }
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await api.getOrders();
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  return (
    <div className="app">
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <header className="header">
        <div className="container">
          <h1>Order Processing System</h1>
        </div>
      </header>
      
      <main className="container">
        <div className="main-content">
          <div className="order-form-section">
            <OrderForm onOrderCreated={handleOrderCreated} />
          </div>
          
          <div className="order-list-section">
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <OrderList 
                orders={orders} 
                onRefresh={fetchOrders}
              />
            )}
          </div>
        </div>
      </main>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};