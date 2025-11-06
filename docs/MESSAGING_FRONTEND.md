# Frontend Messaging System Documentation

## Overview

The frontend messaging system provides a complete real-time chat interface integrated with the backend WebSocket server. It includes Redux state management, WebSocket hooks, and React components for a seamless messaging experience.

## Features

- ✅ Real-time messaging via WebSocket
- ✅ REST API integration for message history
- ✅ Redux state management
- ✅ Conversation list with unread counts
- ✅ Chat window with message history
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Mobile responsive design
- ✅ Auto-scroll to latest messages

## Setup

### Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=http://localhost:8000
```

If `NEXT_PUBLIC_WS_URL` is not set, it will automatically derive from `NEXT_PUBLIC_API_URL`.

## File Structure

```
frontend/
├── services/
│   └── messageService.ts          # API service for messages
├── store/
│   └── slices/
│       └── messageSlice.ts        # Redux slice for message state
├── lib/
│   └── useMessaging.ts            # WebSocket hook
├── components/
│   └── messages/
│       ├── ChatList.tsx          # Conversation list component
│       └── ChatWindow.tsx         # Chat window component
└── app/
    └── messages/
        └── page.tsx              # Messages page
```

## Usage

### Accessing Messages

Navigate to `/messages` in your application. The page requires authentication.

### Using the WebSocket Hook

```typescript
import { useMessaging } from '@/lib/useMessaging';

function MyComponent() {
  const {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    markAsRead,
    isTyping,
  } = useMessaging();

  // Send a message
  const handleSend = () => {
    sendMessage('user-id', 'Hello!');
  };

  // Join a conversation
  useEffect(() => {
    if (isConnected) {
      joinConversation('user-id');
    }
  }, [isConnected, joinConversation]);

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {isTyping && <p>User is typing...</p>}
    </div>
  );
}
```

### Using Redux Actions

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversations,
  fetchConversation,
  sendMessage,
  markConversationAsRead,
} from '@/store/slices/messageSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { conversations, currentConversation, unreadCount } = useAppSelector(
    (state) => state.messages
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSend = async () => {
    try {
      await dispatch(sendMessage({
        receiverId: 'user-id',
        content: 'Hello!',
      })).unwrap();
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };
}
```

## Components

### ChatList

Displays a list of all conversations with:
- User avatars
- Last message preview
- Unread message counts
- Timestamps
- Active conversation highlighting

**Props:**
- `onSelectConversation: (userId: string) => void` - Callback when conversation is selected

### ChatWindow

Displays the chat interface with:
- Message history
- Message input
- Typing indicators
- Read receipts
- Auto-scroll to bottom

**Props:**
- `userId: string | null` - The user ID to chat with
- `onClose?: () => void` - Optional close handler (for mobile)

## Redux State

The message state includes:

```typescript
{
  messages: Message[];              // All messages
  conversations: Conversation[];   // List of conversations
  currentConversation: Message[];   // Current conversation messages
  currentConversationUserId: string | null;  // Current chat user ID
  selectedMessage: Message | null;  // Selected message (for details)
  unreadCount: number;              // Total unread count
  isLoading: boolean;               // Loading state
  isSending: boolean;               // Sending state
  error: string | null;             // Error message
  pagination: {...};                // Messages pagination
  conversationPagination: {...};     // Conversation pagination
}
```

## WebSocket Events

### Client → Server

- `send_message` - Send a message
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `mark_read` - Mark messages as read
- `typing` - Send typing indicator
- `get_unread_count` - Request unread count

### Server → Client

- `connected` - Connection confirmed
- `message_sent` - Message sent confirmation
- `new_message` - New message received
- `message_received` - Message in conversation
- `conversation_joined` - Joined conversation
- `messages_read` - Messages were read
- `user_typing` - User typing indicator
- `unread_count` - Unread count update
- `user_offline` - User went offline
- `error` - Error occurred

## API Integration

All API calls are handled through `messageService`:

```typescript
import { messageService } from '@/services/messageService';

// Send message
await messageService.sendMessage({
  receiverId: 'user-id',
  content: 'Hello!',
});

// Get conversations
const response = await messageService.getConversations();

// Get conversation
const conversation = await messageService.getConversation('user-id');

// Mark as read
await messageService.markAsRead(['message-id-1', 'message-id-2']);
```

## Styling

The components use Tailwind CSS and follow the existing design system. Key classes:

- `bg-white` - White background
- `border-gray-200` - Light gray borders
- `text-gray-900` - Dark text
- `text-blue-500` - Primary blue color
- `rounded-lg` - Rounded corners
- `shadow-sm` - Subtle shadows

## Mobile Responsiveness

The messages page is fully responsive:

- **Desktop**: Side-by-side layout (list + chat)
- **Mobile**: Full-width chat, list hidden when conversation is open

## Error Handling

Errors are handled at multiple levels:

1. **WebSocket errors**: Logged to console, connection retries automatically
2. **API errors**: Displayed in the UI, stored in Redux state
3. **Validation errors**: Shown inline in forms

## Performance Considerations

- Messages are paginated (20 per page by default)
- WebSocket connection is established only when authenticated
- Auto-reconnection with exponential backoff
- Messages are cached in Redux state
- Unread counts are updated in real-time

## Future Enhancements

- [ ] Message search
- [ ] File attachments UI
- [ ] Image preview
- [ ] Voice messages
- [ ] Message reactions
- [ ] Message forwarding
- [ ] Group conversations
- [ ] Message encryption

## Troubleshooting

### WebSocket not connecting

1. Check `NEXT_PUBLIC_WS_URL` environment variable
2. Verify backend server is running
3. Check browser console for connection errors
4. Verify JWT token is valid

### Messages not appearing

1. Check Redux DevTools for state updates
2. Verify WebSocket events are being received
3. Check network tab for API errors
4. Verify user authentication

### Unread counts not updating

1. Check WebSocket connection status
2. Verify `unread_count` event is being received
3. Check Redux state updates
4. Refresh the page to sync with server

