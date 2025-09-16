'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchUserNotifications,
  markNotificationAsRead,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
  selectNotificationError,
  type Notification
} from '@/store/slices/notificationSlice';
import { selectUser } from '@/store/slices/authSlice';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationLoading);
  const error = useAppSelector(selectNotificationError);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter unread notifications from all notifications
  const unreadNotifications = notifications.filter(n => n.status === 'unread');

  // Load notifications when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🔔 Loading notifications for user:', user.id);
      dispatch(fetchUserNotifications({ 
        userId: user.id, 
        filters: { 
          limit: 10,
          includeArchived: false
        } 
      }));
    }
  }, [dispatch, user?.id]);

  // Debug logging
  useEffect(() => {
    console.log('🔔 NotificationBell state:', {
      user: user?.id,
      notificationsCount: notifications.length,
      unreadCount,
      unreadNotificationsCount: unreadNotifications.length,
      isLoading,
      error,
      isDropdownOpen,
      notifications: notifications.map(n => ({ id: n.id, title: n.title, status: n.status, category: n.category }))
    });
  }, [user?.id, notifications.length, unreadCount, unreadNotifications.length, isLoading, error, isDropdownOpen, notifications]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('🔔 NotificationBell error:', error);
    }
  }, [error]);

  const handleBellClick = () => {
    const newIsOpen = !isDropdownOpen;
    setIsDropdownOpen(newIsOpen);
    
    // Refresh notifications when opening the dropdown
    if (newIsOpen && user?.id) {
      console.log('🔔 Refreshing notifications for dropdown');
      // First try to load all notifications to see if there are any
      dispatch(fetchUserNotifications({ 
        userId: user.id, 
        filters: { 
          limit: 10,
          includeArchived: false
        } 
      }));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    dispatch(markNotificationAsRead(notification.id));
    setIsDropdownOpen(false);
  };

  const handleMarkAllRead = () => {
    unreadNotifications.forEach(notification => {
      dispatch(markNotificationAsRead(notification.id));
    });
    setIsDropdownOpen(false);
  };

  const handleTestAPI = () => {
    if (user?.id) {
      console.log('🧪 Testing API call with user ID:', user.id);
      dispatch(fetchUserNotifications({ 
        userId: user.id, 
        filters: { 
          limit: 20,
          page: 1,
          includeArchived: false
        } 
      }));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return '🏠';
      case 'payment': return '💳';
      case 'property': return '🏘️';
      case 'message': return '💬';
      case 'system': return '⚙️';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestAPI}
                className="text-xs text-green-600 hover:text-green-800 transition-colors"
              >
                Test API
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No new notifications</p>
                <div className="text-xs text-gray-400 mt-2">
                  <div>Total notifications: {notifications.length}</div>
                  <div>Unread count: {unreadCount}</div>
                  <div>User ID: {user?.id}</div>
                  <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                  {error && <div className="text-red-400">Error: {error}</div>}
                </div>
              </div>
            ) : (
              unreadNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 cursor-pointer transition-colors`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">{getCategoryIcon(notification.category)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {unreadNotifications.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <a
                href="/notifications"
                className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
