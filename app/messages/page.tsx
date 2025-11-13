"use client";

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchConversations, setCurrentConversationUserId, clearCurrentConversation } from '@/store/slices/messageSlice';
import { ChatList } from '@/components/messages/ChatList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import MainLayout from '../mainLayout';
import { BreadCrumbs } from '@/components/BreadCrumbs';
import { MessageSquare, X } from 'lucide-react';

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const { currentConversationUserId } = useAppSelector((state) => state.messages);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isAuthenticated]);

  const handleSelectConversation = (userId: string) => {
    dispatch(setCurrentConversationUserId(userId));
  };

  const handleCloseConversation = () => {
    dispatch(clearCurrentConversation());
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Please log in to view messages</p>
            <a href="/auth/login" className="text-blue-500 hover:underline">
              Go to Login
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <BreadCrumbs header="Messages" location="Messages" />
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Chat List - Desktop: Always visible, Mobile: Hidden when conversation is open */}
            <div
              className={`
                ${isMobile && currentConversationUserId ? 'hidden' : 'flex'}
                w-full md:w-1/3 border-r border-gray-200 flex-col
              `}
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-blue-500" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatList onSelectConversation={handleSelectConversation} />
              </div>
            </div>

            {/* Chat Window - Desktop: 2/3 width, Mobile: Full width */}
            <div
              className={`
                ${isMobile && !currentConversationUserId ? 'hidden' : 'flex'}
                w-full md:w-2/3 flex-col
              `}
            >
              {currentConversationUserId ? (
                <ChatWindow
                  userId={currentConversationUserId}
                  onClose={isMobile ? handleCloseConversation : undefined}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


