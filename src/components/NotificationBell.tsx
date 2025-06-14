import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notifications';
import { AppNotification } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationBellProps {
  onNotificationClick?: (notification: AppNotification) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const queryClient = useQueryClient();
  const { data: notifications } = useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('New notification received!', payload);
          const newNotification = payload.new as AppNotification;
          toast.info(newNotification.message);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime channel subscribed for notifications`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime channel error for notifications:`, err);
        }
      });

    return () => {
      console.log(`Unsubscribing from realtime channel for notifications`);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    onNotificationClick?.(notification);
  };
  
  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative shrink-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread messages.
            </p>
          </div>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 cursor-pointer p-2 rounded-lg hover:bg-muted",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => handleItemClick(notification)}
                >
                  <span className={cn("flex h-2 w-2 translate-y-1.5 rounded-full", !notification.is_read ? "bg-sky-500" : "bg-muted")} />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">You have no notifications.</p>
            )}
          </div>
           {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending} className="w-full">
                Mark all as read
              </Button>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
