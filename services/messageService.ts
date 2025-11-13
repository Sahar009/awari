import { apiService, ApiResponse } from './api';

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  bookingId?: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  subject?: string;
  content: string;
  attachments?: Array<{
    url: string;
    filename: string;
    type: string;
    size?: number;
  }>;
  status: 'sent' | 'delivered' | 'read' | 'archived';
  readAt?: string;
  isImportant: boolean;
  isSpam: boolean;
  parentMessageId?: string;
  threadId?: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  receiver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  property?: {
    id: string;
    title: string;
    slug: string;
  };
  booking?: {
    id: string;
    bookingType: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  threadId?: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  property?: {
    id: string;
    title: string;
    slug: string;
  };
  lastMessage: Message;
  unreadCount: number;
  totalMessages: number;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  subject?: string;
  propertyId?: string;
  bookingId?: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  parentMessageId?: string;
  attachments?: Array<{
    url: string;
    filename: string;
    type: string;
  }>;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  type?: 'received' | 'sent' | 'all';
  status?: 'sent' | 'delivered' | 'read' | 'archived';
  isImportant?: boolean;
  isSpam?: boolean;
  propertyId?: string;
  bookingId?: string;
  threadId?: string;
}

export interface GetConversationParams {
  page?: number;
  limit?: number;
  propertyId?: string;
  bookingId?: string;
}

// Message Service
export const messageService = {
  // Send a message
  sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<Message>> => {
    return apiService.post<Message>('/messages', data);
  },

  // Get messages
  getMessages: async (params?: GetMessagesParams): Promise<ApiResponse<{
    messages: Message[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return apiService.get(`/messages${queryString ? `?${queryString}` : ''}`);
  },

  // Get all conversations
  getConversations: async (): Promise<ApiResponse<{
    conversations: Conversation[];
  }>> => {
    return apiService.get('/messages/conversations');
  },

  // Get conversation with a specific user
  getConversation: async (
    userId: string,
    params?: GetConversationParams
  ): Promise<ApiResponse<{
    messages: Message[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return apiService.get(`/messages/conversation/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  // Get a single message by ID
  getMessageById: async (messageId: string): Promise<ApiResponse<Message>> => {
    return apiService.get(`/messages/${messageId}`);
  },

  // Update a message
  updateMessage: async (
    messageId: string,
    data: {
      status?: 'sent' | 'delivered' | 'read' | 'archived';
      isImportant?: boolean;
      isSpam?: boolean;
    }
  ): Promise<ApiResponse<Message>> => {
    return apiService.put(`/messages/${messageId}`, data);
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete(`/messages/${messageId}`);
  },

  // Mark messages as read
  markAsRead: async (messageIds: string[]): Promise<ApiResponse<{ updatedCount: number }>> => {
    return apiService.post('/messages/mark-read', { messageIds });
  },

  // Mark conversation as read
  markConversationAsRead: async (userId: string): Promise<ApiResponse<{ updatedCount: number }>> => {
    return apiService.post(`/messages/conversation/${userId}/mark-read`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    return apiService.get('/messages/unread-count');
  },
};

export default messageService;


