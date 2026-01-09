import React from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { markRead, markAllReadLocal } from '@/store/notificationSlice'
import { cn } from '@/lib/utils'

export default function NotificationMenu() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(state => state.notifications.items)
  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkRead = (id: number) => {
      dispatch(markRead(id))
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
      e.stopPropagation()
      dispatch(markAllReadLocal())
      // Ideally trigger API call too
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
                <span 
                    className="text-xs text-primary cursor-pointer hover:underline" 
                    onClick={handleMarkAllRead}
                >
                    Mark all read
                </span>
            )}
        </div>
        {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No notifications
            </div>
        ) : (
            notifications.map((notification) => (
                <DropdownMenuItem 
                    key={notification.id} 
                    className={cn(
                        "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-muted/50 border-b last:border-0", 
                        !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                    onClick={() => handleMarkRead(notification.id)}
                >
                    <div className="flex items-center justify-between w-full">
                        <span className={cn("text-sm font-medium", !notification.is_read && "text-primary")}>
                            {notification.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                    </p>
                </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
