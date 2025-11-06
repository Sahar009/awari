import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { messageService, Message, Conversation, SendMessageRequest, GetMessagesParams } from '../../services/messageService';

// Types
export interface MessageState {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Message[];
  currentConversationUserId: string | null;
  selectedMessage: Message | null;
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  conversationPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const initialState: MessageState = {
  messages: [],
  conversations: [],
  currentConversation: [],
  currentConversationUserId: null,
  selectedMessage: null,
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  conversationPagination: {
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
  },
};

// Async Thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params?: GetMessagesParams, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(params);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch messages');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getConversations();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch conversations');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'messages/fetchConversation',
  async (
    { userId, params }: { userId: string; params?: { page?: number; limit?: number; propertyId?: string; bookingId?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await messageService.getConversation(userId, params);
      if (response.success) {
        return { userId, data: response.data };
      }
      return rejectWithValue(response.message || 'Failed to fetch conversation');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (data: SendMessageRequest, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to send message');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageIds: string[], { rejectWithValue }) => {
    try {
      const response = await messageService.markAsRead(messageIds);
      if (response.success) {
        return { messageIds, updatedCount: response.data.updatedCount };
      }
      return rejectWithValue(response.message || 'Failed to mark messages as read');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read');
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await messageService.markConversationAsRead(userId);
      if (response.success) {
        return { userId, updatedCount: response.data.updatedCount };
      }
      return rejectWithValue(response.message || 'Failed to mark conversation as read');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark conversation as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getUnreadCount();
      if (response.success) {
        return response.data.unreadCount;
      }
      return rejectWithValue(response.message || 'Failed to fetch unread count');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

// Message Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMessage: (state, action: PayloadAction<Message | null>) => {
      state.selectedMessage = action.payload;
    },
    setCurrentConversationUserId: (state, action: PayloadAction<string | null>) => {
      state.currentConversationUserId = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = [];
      state.currentConversationUserId = null;
    },
    // WebSocket actions
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      
      // Add to messages list if not already present
      const existingIndex = state.messages.findIndex(m => m.id === message.id);
      if (existingIndex === -1) {
        state.messages.unshift(message);
      } else {
        state.messages[existingIndex] = message;
      }

      // Add to current conversation if it matches
      if (state.currentConversationUserId === message.senderId || 
          state.currentConversationUserId === message.receiverId) {
        const convIndex = state.currentConversation.findIndex(m => m.id === message.id);
        if (convIndex === -1) {
          state.currentConversation.push(message);
        } else {
          state.currentConversation[convIndex] = message;
        }
      }

      // Update conversation in conversations list
      const conversationIndex = state.conversations.findIndex(
        conv => conv.otherUser.id === message.senderId || conv.otherUser.id === message.receiverId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        if (state.currentConversationUserId !== message.senderId) {
          state.conversations[conversationIndex].unreadCount += 1;
        }
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: string; readAt?: string }>) => {
      const { messageId, status, readAt } = action.payload;
      
      // Update in messages list
      const messageIndex = state.messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex].status = status as any;
        if (readAt) {
          state.messages[messageIndex].readAt = readAt;
        }
      }

      // Update in current conversation
      const convIndex = state.currentConversation.findIndex(m => m.id === messageId);
      if (convIndex !== -1) {
        state.currentConversation[convIndex].status = status as any;
        if (readAt) {
          state.currentConversation[convIndex].readAt = readAt;
        }
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    updateConversationUnreadCount: (state, action: PayloadAction<{ userId: string; count: number }>) => {
      const { userId, count } = action.payload;
      const conversationIndex = state.conversations.findIndex(
        conv => conv.otherUser.id === userId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCount = count;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Conversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload.data.messages;
        state.currentConversationUserId = action.payload.userId;
        state.conversationPagination = action.payload.data.pagination;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        // Message will be added via WebSocket or manually
        if (state.currentConversationUserId === action.payload.receiverId || 
            state.currentConversationUserId === action.payload.senderId) {
          state.currentConversation.push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })
      // Mark as Read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        action.payload.messageIds.forEach(messageId => {
          const message = state.messages.find(m => m.id === messageId);
          if (message) {
            message.status = 'read';
            message.readAt = new Date().toISOString();
          }
          const convMessage = state.currentConversation.find(m => m.id === messageId);
          if (convMessage) {
            convMessage.status = 'read';
            convMessage.readAt = new Date().toISOString();
          }
        });
      })
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.currentConversation.forEach(message => {
          if (message.senderId === userId && message.status !== 'read') {
            message.status = 'read';
            message.readAt = new Date().toISOString();
          }
        });
        const conversationIndex = state.conversations.findIndex(
          conv => conv.otherUser.id === userId
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0;
        }
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedMessage,
  setCurrentConversationUserId,
  clearCurrentConversation,
  addMessage,
  updateMessageStatus,
  updateUnreadCount,
  updateConversationUnreadCount,
} = messageSlice.actions;

export default messageSlice.reducer;

