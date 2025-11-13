"use client";

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchConversations, setCurrentConversationUserId } from '@/store/slices/messageSlice';
import { Conversation } from '@/services/messageService';
import { Avatar } from '@/components/ui/Avatar';
import { Loader } from '@/components/ui/Loader';

interface ChatListProps {
  onSelectConversation: (userId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectConversation }) => {
  const dispatch = useAppDispatch();
  const { conversations, isLoading, currentConversationUserId } = useAppSelector(
    (state) => state.messages
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <p className="text-center">No conversations yet</p>
        <p className="text-sm mt-2">Start a conversation by messaging someone</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {conversations.map((conversation: Conversation) => {
        const isActive = currentConversationUserId === conversation.otherUser.id;
        const otherUser = conversation.otherUser;
        const lastMessage = conversation.lastMessage;

        return (
          <div
            key={conversation.threadId || otherUser.id}
            onClick={() => {
              dispatch(setCurrentConversationUserId(otherUser.id));
              onSelectConversation(otherUser.id);
            }}
            className={`
              flex items-center gap-3 p-4 cursor-pointer border-b border-gray-200
              hover:bg-gray-50 transition-colors
              ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            `}
          >
            <div className="relative flex-shrink-0">
              <Avatar
                src={otherUser.avatarUrl}
                alt={`${otherUser.firstName} ${otherUser.lastName}`}
                size="md"
              />
              {conversation.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTime(lastMessage.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage.content}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


