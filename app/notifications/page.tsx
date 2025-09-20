'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Filter, Archive, Trash2, CheckCircle, Search, Home, CreditCard, Building2, MessageCircle, Settings, Clock, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  fetchNotificationStats,
  selectNotifications,
  // selectNotificationStats, // Removed as it's not used
  selectNotificationPagination,
  selectNotificationLoading,
  selectNotificationError,
  selectUnreadCount,
  clearError,
  type Notification,
  type NotificationFilters
} from '@/store/slices/notificationSlice';
import { selectUser } from '@/store/slices/authSlice';
import { useToast } from '@/components/ui/useToast';
import NotificationModal from '@/components/notifications/NotificationModal';
import MainLayout from '@/app/mainLayout';

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  // Redux state
  const user = useAppSelector(selectUser);
  const notifications = useAppSelector(selectNotifications);
  // const stats = useAppSelector(selectNotificationStats); // Removed as it's not used
  const pagination = useAppSelector(selectNotificationPagination);
  const isLoading = useAppSelector(selectNotificationLoading);
  const error = useAppSelector(selectNotificationError);
  const unreadCount = useAppSelector(selectUnreadCount);

  // Local state
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
    unreadOnly: false,
    includeArchived: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load notifications and stats on component mount
  useEffect(() => {
    if (user?.id) {
      console.log('🔔 Loading initial notifications for user:', user.id);
      dispatch(fetchUserNotifications({ 
        userId: user.id, 
        filters: { 
          page: 1,
          limit: 20,
          includeArchived: false
        } 
      }));
      dispatch(fetchNotificationStats(user.id));
    }
  }, [dispatch, user?.id]);

  // Reload notifications when filters change
  useEffect(() => {
    if (user?.id) {
      const updatedFilters = {
        ...filters,
        category: selectedCategory === 'all' ? undefined : selectedCategory as 'booking' | 'payment' | 'property' | 'message' | 'system' | 'reminder',
        status: selectedStatus === 'all' ? undefined : selectedStatus as 'unread' | 'read' | 'archived',
      };
      console.log('🔔 Reloading notifications with filters:', updatedFilters);
      dispatch(fetchUserNotifications({ userId: user.id, filters: updatedFilters }));
    }
  }, [dispatch, user?.id, filters.page, filters.limit, selectedCategory, selectedStatus, filters.unreadOnly, filters.includeArchived]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error('Error', error);
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('🔔 NotificationsPage state:', {
      user: user?.id,
      notificationsCount: notifications.length,
      unreadCount,
      isLoading,
      error,
      notifications: notifications.map(n => ({ id: n.id, title: n.title, status: n.status, category: n.category }))
    });
  }, [user?.id, notifications.length, unreadCount, isLoading, error, notifications]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    // Mark as read if unread
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
    toast.success('Success', 'All notifications marked as read');
  };

  const handleArchiveNotification = (notificationId: string) => {
    dispatch(archiveNotification(notificationId));
    toast.success('Success', 'Notification archived');
  };

  const handleDeleteNotification = (notificationId: string) => {
    dispatch(deleteNotification(notificationId));
    toast.success('Success', 'Notification deleted');
  };

  const handleLoadMore = () => {
    if (user?.id && pagination?.hasNext) {
      const updatedFilters = {
        ...filters,
        page: (filters.page || 1) + 1,
        category: selectedCategory === 'all' ? undefined : selectedCategory as 'booking' | 'payment' | 'property' | 'message' | 'system' | 'reminder',
        status: selectedStatus === 'all' ? undefined : selectedStatus as 'unread' | 'read' | 'archived',
      };
      dispatch(fetchUserNotifications({ userId: user.id, filters: updatedFilters }));
    }
  };

  const handleRefresh = () => {
    if (user?.id) {
      console.log('🔄 Refreshing notifications...');
      const updatedFilters = {
        page: 1,
        limit: 20,
        includeArchived: filters.includeArchived,
        unreadOnly: filters.unreadOnly,
        category: selectedCategory === 'all' ? undefined : selectedCategory as 'booking' | 'payment' | 'property' | 'message' | 'system' | 'reminder',
        status: selectedStatus === 'all' ? undefined : selectedStatus as 'unread' | 'read' | 'archived',
      };
      dispatch(fetchUserNotifications({ userId: user.id, filters: updatedFilters }));
      toast.success('Success', 'Notifications refreshed');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return notification.title.toLowerCase().includes(searchLower) || 
             notification.message.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return <Home className="h-5 w-5 text-blue-600" />;
      case 'payment': return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'property': return <Building2 className="h-5 w-5 text-purple-600" />;
      case 'message': return <MessageCircle className="h-5 w-5 text-orange-600" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />;
      case 'reminder': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view notifications</h1>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pt-25">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Read
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Cards - Removed as they weren't working properly */}

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="property">Property</option>
                <option value="message">Message</option>
                <option value="system">System</option>
                <option value="reminder">Reminder</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>

              {/* Toggle Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.unreadOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Unread Only</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.includeArchived}
                    onChange={(e) => setFilters(prev => ({ ...prev, includeArchived: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Include Archived</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600 mb-4">You&apos;re all caught up! Check back later for new updates.</p>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Notifications
              </button>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  notification.isArchived 
                    ? 'bg-orange-50 border-orange-200 border-l-4 border-l-orange-500' 
                    : !notification.isRead 
                      ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' 
                      : 'bg-white border-gray-200'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8">{getCategoryIcon(notification.category)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        
                        {!notification.isRead && !notification.isArchived && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                              NEW
                            </span>
                          </div>
                        )}
                        
                        {notification.isArchived && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                            <Archive className="h-3 w-3" />
                            Archived
                          </span>
                        )}
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${!notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{notification.category}</span>
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveNotification(notification.id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length >= 10 && pagination?.hasNext && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : `Load More (Page ${pagination.page + 1})`}
            </button>
          </div>
        )}

        {/* Notification Modal */}
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNotification(null);
          }}
          notification={selectedNotification}
          onArchive={handleArchiveNotification}
          onDelete={handleDeleteNotification}
        />
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
