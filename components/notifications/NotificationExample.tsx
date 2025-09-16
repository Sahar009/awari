'use client';

import React, { useState } from 'react';
import { Bell, Plus, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchUserNotifications,
  fetchNotificationStats,
  selectNotifications,
  selectNotificationStats,
  selectUnreadCount,
  selectNotificationLoading,
} from '@/store/slices/notificationSlice';
import { selectUser } from '@/store/slices/authSlice';

const NotificationExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const notifications = useAppSelector(selectNotifications);
  const stats = useAppSelector(selectNotificationStats);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationLoading);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchUserNotifications({ 
        userId: user.id, 
        filters: { 
          limit: 20,
          includeArchived: showArchived,
          status: showArchived ? 'archived' : undefined
        } 
      }));
      dispatch(fetchNotificationStats(user.id));
    }
  };

  const handleToggleArchived = () => {
    const newShowArchived = !showArchived;
    setShowArchived(newShowArchived);
    
    if (user?.id) {
      dispatch(fetchUserNotifications({ 
        userId: user.id, 
        filters: { 
          limit: 20,
          includeArchived: newShowArchived,
          status: newShowArchived ? 'archived' : undefined
        } 
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notification System</h3>
          <p className="text-gray-600">Please log in to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {showArchived ? 'Archived Notifications' : 'Notification System'}
            </h3>
            <p className="text-gray-600">
              {showArchived 
                ? 'View your archived notifications' 
                : 'Manage your notifications and preferences'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleArchived}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showArchived 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📁
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-red-600">Unread</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-4 mb-6">
        <a
          href="/notifications"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Bell className="h-4 w-4" />
          View All Notifications
        </a>
        
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* All Notifications */}
      {isExpanded && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {showArchived ? 'Archived Notifications' : 'All Notifications'}
          </h4>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">
                {showArchived ? 'No archived notifications found' : 'No notifications found'}
              </p>
              {showArchived && (
                <p className="text-sm text-gray-500 mt-2">
                  Archived notifications will appear here once you archive some notifications.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 rounded-lg ${
                    notification.isArchived 
                      ? 'bg-orange-50 border-orange-200 border-l-orange-500' 
                      : !notification.isRead 
                        ? 'bg-blue-50 border-blue-200 border-l-blue-500' 
                        : 'bg-gray-50 border-gray-200 border-l-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getCategoryIcon(notification.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={`font-medium ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                          {notification.title}
                        </h5>
                        {!notification.isRead && !notification.isArchived && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                              NEW
                            </span>
                          </div>
                        )}
                        {notification.isArchived && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                            📁 Archived
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${!notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="capitalize">{notification.category}</span>
                        <span>{formatDate(notification.createdAt)}</span>
                        <span className={`capitalize ${
                          notification.priority === 'urgent' ? 'text-red-600' :
                          notification.priority === 'high' ? 'text-orange-600' :
                          notification.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API Endpoints Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Available API Endpoints:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• GET /api/notifications/user/{user.id} - Fetch user notifications</div>
          <div>• PATCH /api/notifications/:id/read - Mark as read</div>
          <div>• PATCH /api/notifications/read-all - Mark all as read</div>
          <div>• PATCH /api/notifications/:id/archive - Archive notification</div>
          <div>• DELETE /api/notifications/:id - Delete notification</div>
          <div>• GET /api/notifications/stats/{user.id} - Get notification stats</div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-1">Filter Parameters:</h5>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• includeArchived=true - Include archived notifications</div>
            <div>• status=archived - Show only archived notifications</div>
            <div>• unreadOnly=true - Show only unread notifications</div>
            <div>• category=booking|payment|property|message|system|reminder</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationExample;
