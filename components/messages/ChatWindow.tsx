"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversation,
  sendMessage,
  markConversationAsRead,
  clearCurrentConversation,
} from '@/store/slices/messageSlice';
import { useMessaging } from '@/lib/useMessaging';
import { Message } from '@/services/messageService';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatWindowProps {
  userId: string | null;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ userId, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentConversation, isLoading, isSending, error } = useAppSelector(
    (state) => state.messages
  );
  const { user } = useAppSelector((state) => state.auth);
  const { sendMessage: sendMessageWS, joinConversation, leaveConversation, markAsRead, isTyping, typingUserId } = useMessaging();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchConversation({ userId }));
      joinConversation(userId);
    }

    return () => {
      if (userId) {
        leaveConversation(userId);
      }
    };
  }, [userId, dispatch, joinConversation, leaveConversation]);

  useEffect(() => {
    if (userId && currentConversation.length > 0) {
      // Mark conversation as read when viewing
      dispatch(markConversationAsRead(userId));
      markAsRead(undefined, userId);
    }
  }, [userId, currentConversation.length, dispatch, markAsRead]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId || isSending) return;

    const content = messageText.trim();
    setMessageText('');

    // Send via WebSocket for real-time
    sendMessageWS(userId, content);

    // Also send via API as fallback
    try {
      await dispatch(sendMessage({
        receiverId: userId,
        content,
      })).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  const otherUser = currentConversation[0]?.senderId === user?.id
    ? currentConversation[0]?.receiver
    : currentConversation[0]?.sender;

  if (isLoading && currentConversation.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {otherUser && (
            <>
              <Avatar
                src={otherUser.avatarUrl}
                alt={`${otherUser.firstName} ${otherUser.lastName}`}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                {isTyping && typingUserId === userId && (
                  <p className="text-sm text-gray-500">typing...</p>
                )}
              </div>
            </>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Close conversation"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {currentConversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentConversation.map((message: Message, index: number) => {
              const isOwnMessage = message.senderId === user?.id;
              const showDate = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(currentConversation[index - 1].createdAt).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwnMessage && (
                      <Avatar
                        src={message.sender?.avatarUrl}
                        alt={`${message.sender?.firstName} ${message.sender?.lastName}`}
                        size="sm"
                      />
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwnMessage && (
                          <span className="text-xs opacity-70">
                            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwnMessage && (
                      <Avatar
                        src={user?.avatarUrl}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        {error && (
          <div className="mb-2 text-sm text-red-500">{error}</div>
        )}
        <div className="flex items-end gap-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

