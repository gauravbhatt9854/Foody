import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to server');
        setIsConnected(true);
        
        // Join appropriate rooms based on user role
        if (user.role === 'staff' || user.role === 'admin') {
          newSocket.emit('join-staff-room');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // Order-related events for students
      if (user.role === 'student') {
        newSocket.on('order-status-updated', (data) => {
          toast.success(
            `Order ${data.orderNumber} status updated to ${data.status.toUpperCase()}`,
            {
              position: 'top-right',
              autoClose: 5000,
            }
          );
        });

        newSocket.on('payment-updated', (data) => {
          if (data.paymentStatus === 'completed') {
            toast.success(
              `Payment confirmed for order ${data.orderNumber}`,
              {
                position: 'top-right',
                autoClose: 5000,
              }
            );
          } else if (data.paymentStatus === 'failed') {
            toast.error(
              `Payment failed for order ${data.orderNumber}`,
              {
                position: 'top-right',
                autoClose: 5000,
              }
            );
          }
        });
      }

      // Staff-specific events
      if (user.role === 'staff' || user.role === 'admin') {
        newSocket.on('new-order', (data) => {
          toast.info(
            `New order ${data.orderNumber} from ${data.customer} - $${data.totalAmount}`,
            {
              position: 'top-right',
              autoClose: 7000,
            }
          );
          
          // Play notification sound (optional)
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {
              // Ignore audio play errors (user interaction required)
            });
          } catch (error) {
            // Ignore audio errors
          }
        });

        newSocket.on('payment-received', (data) => {
          toast.success(
            `Payment received for order ${data.orderNumber} - $${data.amount}`,
            {
              position: 'top-right',
              autoClose: 5000,
            }
          );
        });
      }

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Join order room for tracking specific order updates
  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join-order-room', orderId);
    }
  };

  // Leave order room
  const leaveOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('leave-order-room', orderId);
    }
  };

  // Emit custom events
  const emit = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  // Listen to custom events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Return cleanup function
      return () => {
        socket.off(event, callback);
      };
    }
  };

  // Remove event listeners
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinOrderRoom,
    leaveOrderRoom,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;