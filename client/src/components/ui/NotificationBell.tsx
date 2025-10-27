import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/lib/currency";

export function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return t("notifications.justNow");
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t("notifications.noNotifications")}
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    {t("notifications.newOrder")} #{notification.orderNumber}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {notification.customerName}
                </span>
                <span className="text-sm font-medium text-primary">
                  {formatPrice(parseFloat(notification.total))}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
