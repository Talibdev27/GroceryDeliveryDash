import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import io, { Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: string;
  orderId: number;
  orderNumber: number;
  customerName: string;
  customerEmail?: string;
  total: string;
  itemCount: number;
  timestamp: string;
  message: string;
  priority: string;
  read: boolean;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return;
    }

    // Determine socket URL - use same origin in production, or explicit URL in dev
    // In dev, server runs on port 4000, in production use same origin
    const socketUrl = import.meta.env.VITE_API_URL || 
                     (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);
    
    console.log('🔌 Connecting to Socket.io at:', socketUrl);
    console.log('🔌 Environment:', import.meta.env.DEV ? 'development' : 'production');
    
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Connection event
    newSocket.on('connect', () => {
      console.log('🔌 Connected to notification server:', newSocket.id);
      setIsConnected(true);
      // Join admin room
      newSocket.emit('join-admin-room', user.id);
      console.log(`👤 Admin ${user.id} joined admin room`);
    });

    // Listen for new orders
    newSocket.on('new-order', (notification: Notification) => {
      console.log('🔔 New order notification received:', notification);
      console.log('🔔 Notification details:', {
        orderId: notification.orderId,
        customerName: notification.customerName,
        total: notification.total,
        itemCount: notification.itemCount,
        timestamp: notification.timestamp
      });
      
      // Add to notifications list (prepend to show newest first)
      setNotifications(prev => {
        // Check if notification already exists (prevent duplicates)
        const exists = prev.some(n => n.id === notification.id);
        if (exists) {
          return prev;
        }
        return [notification, ...prev];
      });
      
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      toast({
        title: "🔔 New Order!",
        description: notification.message,
        duration: 5000,
      });

      // Play notification sound (if audio element exists)
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.5;
          audioRef.current.play().catch(err => {
            console.log('Audio play failed (may require user interaction):', err);
          });
        } catch (err) {
          console.log('Audio not supported');
        }
      }

      // Optional: Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('New Order', {
            body: notification.message,
            icon: '/logo.png',
            tag: `order-${notification.orderId}`,
            requireInteraction: false
          });
        } catch (err) {
          console.log('Browser notification failed:', err);
        }
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from notification server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket.io connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting Socket.io');
      newSocket.disconnect();
    };
  }, [user, toast]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Browser notification permission:', permission);
      });
    }
  }, []);

  // Create audio element for notification sound
  useEffect(() => {
    // Create audio element (will use a simple beep or you can add notification.mp3)
    const audio = new Audio();
    audio.src = '/notification.mp3'; // Add this file to public folder, or use data URI for beep
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    // Navigate to order details
    window.location.href = `/admin/orders?orderId=${notification.orderId}`;
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" title={isConnected ? "Notifications connected" : "Notifications offline"}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {!isConnected && (
              <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white" title="Disconnected" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Connected" : "Disconnected"} />
              </div>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-muted/50 border-border' 
                        : 'bg-primary/5 border-primary/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${notification.read ? '' : 'font-semibold'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.customerName} • {formatCurrency(parseFloat(notification.total))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                    >
                      View Order →
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

