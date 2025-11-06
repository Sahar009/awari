import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addMessage, 
  updateMessageStatus, 
  updateUnreadCount,
  updateConversationUnreadCount,
  markConversationAsRead
} from '@/store/slices/messageSlice';
import { Message } from '@/services/messageService';
import { authService } from '@/services/authService';

interface UseMessagingReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (receiverId: string, content: string, options?: {
    subject?: string;
    propertyId?: string;
    bookingId?: string;
    attachments?: Array<{ url: string; filename: string; type: string }>;
  }) => void;
  joinConversation: (otherUserId: string, options?: {
    propertyId?: string;
    bookingId?: string;
  }) => void;
  leaveConversation: (otherUserId: string) => void;
  markAsRead: (messageIds?: string[], senderId?: string) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
  isTyping: boolean;
  typingUserId: string | null;
}

export const useMessaging = (): UseMessagingReturn => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentConversationUserId } = useAppSelector((state) => state.messages);
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get WebSocket URL from environment or default
  const getWebSocketURL = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
    }
    return 'http://localhost:8000';
  };
  
  const WS_URL = getWebSocketURL();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Initialize socket connection
    const socket = io(WS_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('✅ Messaging service connected:', data);
      setIsConnected(true);
    });

    // Message events
    socket.on('message_sent', (data) => {
      console.log('✅ Message sent:', data);
      if (data.success && data.data) {
        dispatch(addMessage(data.data as Message));
      }
    });

    socket.on('new_message', (data) => {
      console.log('📨 New message received:', data);
      if (data.success && data.data) {
        dispatch(addMessage(data.data as Message));
      }
    });

    socket.on('message_received', (data) => {
      console.log('📬 Message in conversation:', data);
      if (data.success && data.data) {
        dispatch(addMessage(data.data as Message));
      }
    });

    // Conversation events
    socket.on('conversation_joined', (data) => {
      console.log('✅ Joined conversation:', data);
    });

    socket.on('conversation_left', (data) => {
      console.log('👋 Left conversation:', data);
    });

    // Read receipts
    socket.on('messages_read', (data) => {
      console.log('✅ Messages read by:', data.userId);
      // Update message statuses if needed
    });

    // Typing indicators
    socket.on('user_typing', (data) => {
      setTypingUserId(data.userId);
      setIsTyping(data.isTyping);
      
      // Clear typing indicator after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      if (data.isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUserId(null);
        }, 3000);
      }
    });

    // Unread count
    socket.on('unread_count', (data) => {
      console.log('📊 Unread count:', data);
      dispatch(updateUnreadCount(data.unreadCount));
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Request unread count on connection
    socket.emit('get_unread_count');

    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, dispatch, WS_URL]);

  // Send message
  const sendMessage = useCallback((
    receiverId: string,
    content: string,
    options?: {
      subject?: string;
      propertyId?: string;
      bookingId?: string;
      attachments?: Array<{ url: string; filename: string; type: string }>;
    }
  ) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    socketRef.current.emit('send_message', {
      receiverId,
      content,
      subject: options?.subject,
      propertyId: options?.propertyId,
      bookingId: options?.bookingId,
      messageType: 'text',
      attachments: options?.attachments,
    });
  }, [isConnected]);

  // Join conversation
  const joinConversation = useCallback((
    otherUserId: string,
    options?: {
      propertyId?: string;
      bookingId?: string;
    }
  ) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    socketRef.current.emit('join_conversation', {
      otherUserId,
      propertyId: options?.propertyId,
      bookingId: options?.bookingId,
    });
  }, [isConnected]);

  // Leave conversation
  const leaveConversation = useCallback((otherUserId: string) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('leave_conversation', {
      otherUserId,
    });
  }, [isConnected]);

  // Mark as read
  const markAsRead = useCallback((messageIds?: string[], senderId?: string) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('mark_read', {
      messageIds,
      senderId,
    });

    // Also dispatch Redux action if senderId is provided
    if (senderId) {
      dispatch(markConversationAsRead(senderId));
    }
  }, [isConnected, dispatch]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('typing', {
      receiverId,
      isTyping,
    });
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    sendTypingIndicator,
    isTyping,
    typingUserId,
  };
};

