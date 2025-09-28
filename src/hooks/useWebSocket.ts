import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { OrderEvent } from '../types';

interface UseWebSocketProps {
  onOrderUpdate?: (orderEvent: OrderEvent) => void;
}

export const useWebSocket = ({ onOrderUpdate }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    // Create socket connection
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to real-time updates');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from real-time updates');
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
      console.error('Socket connection error:', error);
    });

    // Order update handler
    socket.on('orderUpdate', (orderEvent: OrderEvent) => {
      console.log('Received order update:', orderEvent);
      
      // Show notification
      const statusMessages = {
        ORDER_CREATED: `New order created: ${orderEvent.orderId}`,
        ORDER_UPDATED: `Order ${orderEvent.orderId} updated to ${orderEvent.order.status}`,
        ORDER_CANCELLED: `Order ${orderEvent.orderId} cancelled`,
      };
      
      toast.success(statusMessages[orderEvent.eventType] || 'Order updated');
      
      // Call the callback
      if (onOrderUpdate) {
        onOrderUpdate(orderEvent);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('orderUpdate');
        socket.close();
      }
    };
  }, [onOrderUpdate]);

  return {
    isConnected,
    socket: socketRef.current,
  };
};