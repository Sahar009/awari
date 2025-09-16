'use client';

import React from 'react';
import { X, Archive, Trash2, Clock, Tag, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { type Notification } from '@/store/slices/notificationSlice';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  onArchive: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notification,
  onArchive,
  onDelete,
}) => {
  if (!isOpen || !notification) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'booking': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'property': return 'text-purple-600 bg-purple-100';
      case 'message': return 'text-indigo-600 bg-indigo-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'reminder': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'read': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const dateInfo = formatDate(notification.createdAt);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getCategoryIcon(notification.category)}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{notification.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(notification.status)}
                <span className="text-sm text-gray-600 capitalize">{notification.status}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">{notification.message}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notification.category)}`}>
                      {notification.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-600">Priority:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>
                </div>

                {notification.type && (
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="ml-2 text-sm text-gray-800">{notification.type}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-600">Created:</span>
                    <div className="text-sm text-gray-800">
                      {dateInfo.date} at {dateInfo.time}
                    </div>
                    <div className="text-xs text-gray-500">{dateInfo.relative}</div>
                  </div>
                </div>

                {notification.readAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <div>
                      <span className="text-sm text-gray-600">Read:</span>
                      <div className="text-sm text-gray-800">
                        {formatDate(notification.readAt).date} at {formatDate(notification.readAt).time}
                      </div>
                    </div>
                  </div>
                )}

                {notification.archivedAt && (
                  <div className="flex items-center gap-3">
                    <Archive className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Archived:</span>
                      <div className="text-sm text-gray-800">
                        {formatDate(notification.archivedAt).date} at {formatDate(notification.archivedAt).time}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Data */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Data</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onArchive(notification.id)}
              disabled={notification.isArchived}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive className="h-4 w-4" />
              {notification.isArchived ? 'Archived' : 'Archive'}
            </button>
            
            <button
              onClick={() => onDelete(notification.id)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
