import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  orderId: number;
  orderNumber: number;
  customerName: string;
  total: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin" || user.role === "rider")) {
      // Connect to WebSocket
      const newSocket = io(window.location.origin);
      
      newSocket.on("connect", () => {
        console.log("Connected to notification server");
        newSocket.emit("register", user.id);
      });
      
      newSocket.on("new-order", (orderData) => {
        const notification: Notification = {
          id: `${Date.now()}-${orderData.orderId}`,
          ...orderData,
          read: false
        };
        
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Order Received!", {
            body: `Order #${orderData.orderNumber} from ${orderData.customerName}`,
            icon: "/logo.png",
            badge: "/logo.png"
          });
        }
        
        // Play sound (using Web Audio API for a simple beep)
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
          console.log("Could not play notification sound:", e);
        }
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);
  
  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return a default context instead of throwing an error
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {}
    };
  }
  return context;
};
