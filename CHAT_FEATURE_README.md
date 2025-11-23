# AI Chat Feature - Integration Guide

This document explains the AI Chat feature that has been integrated into your Laravel education platform.

## Overview

The AI Chat feature connects your education platform to an external DeepSeek AI API (running on `http://localhost:5000`), allowing users to have conversations with an AI assistant.

## Features Implemented

### 1. Database Structure
- **chat_conversations** table: Stores conversation metadata
    - `id`: Conversation ID
    - `user_id`: Owner of the conversation
    - `external_chat_id`: Reference to external API chat ID
    - `title`: Conversation title (auto-generated from first message)
    - `is_active`: Status flag
    - `timestamps`: Created and updated timestamps

- **chat_messages** table: Stores individual messages
    - `id`: Message ID
    - `conversation_id`: Reference to conversation
    - `role`: Either 'user' or 'assistant'
    - `content`: Message content
    - `timestamps`: Message timestamps

### 2. Backend Components

#### Models
- `ChatConversation` - Manages conversation data
- `ChatMessage` - Manages message data

#### Controller
- `ChatController` - Handles all chat operations:
    - `index()` - Lists all conversations
    - `show($id)` - Shows a specific conversation with messages
    - `store()` - Creates a new conversation
    - `sendMessage($id)` - Sends a message and gets AI response
    - `update($id)` - Updates conversation title
    - `destroy($id)` - Deletes a conversation
    - `checkApiStatus()` - Checks if external API is available

#### Routes
All chat routes are protected by authentication:
- `GET /chat` - Chat conversations list
- `POST /chat` - Create new conversation
- `GET /chat/{id}` - View conversation
- `POST /chat/{id}/message` - Send message
- `PUT /chat/{id}` - Update conversation
- `DELETE /chat/{id}` - Delete conversation
- `GET /chat/api/status` - Check API status

### 3. Frontend Components

#### Pages
- `Chat/Index.jsx` - Conversations list view
    - Grid display of all conversations
    - Create new conversation button
    - Empty state for no conversations
    - Click to open conversation

- `Chat/Show.jsx` - Chat interface
    - Sidebar with conversation list
    - Message display area
    - Message input with send button
    - Edit conversation title
    - Delete conversation
    - Real-time message updates
    - Loading indicators
    - Error handling with helpful messages

#### Navigation
- AI Chat link added to all user role menus
- Icon: ChatBubbleLeftRightIcon
- Accessible from main navigation

### 4. Key Features

#### User Experience
- Beautiful, modern chat interface
- Smooth animations and transitions
- Real-time message sending
- Conversation management (create, rename, delete)
- Conversation history sidebar
- Auto-scrolling to latest messages
- Typing indicators while AI responds
- Error messages with helpful troubleshooting tips

#### API Integration
- Connects to external DeepSeek AI API
- Automatic chat ID management
- 120-second timeout for AI responses
- Graceful error handling
- Connection status checking

## Setup Instructions

### 1. Database Migration

Run the migration to create the necessary tables:

```bash
php artisan migrate
```

This will create:
- `chat_conversations` table
- `chat_messages` table

### 2. External API Setup

The chat feature requires the DeepSeek Automation API to be running.

**Start the External API:**

According to the API_INTEGRATION_GUIDE.md:

```bash
cd backend
python app.py
```

The API should be running at `http://localhost:5000`

**Authenticate the Bot:**
1. Open the web interface at `http://localhost:5173`
2. Select DeepSeek website
3. Click "Connect" to authenticate
4. Wait for authentication to complete

### 3. Configuration

The external API URL is configured in `ChatController.php`:

```php
private $externalApiUrl = 'http://localhost:5000';
```

Change this if your external API runs on a different URL.

### 4. Access the Chat Feature

Once everything is set up:

1. Log in to your education platform
2. Click "AI Chat" (المساعد الذكي) in the navigation menu
3. Create a new conversation
4. Start chatting with the AI assistant!

## Usage Guide

### For Users

#### Starting a Conversation
1. Navigate to the Chat page from the main menu
2. Click "New Chat" button
3. Type your message in the input field
4. Press Enter or click the send button

#### Managing Conversations
- **Rename**: Click the pencil icon next to the conversation title
- **Delete**: Click the trash icon in the conversation header
- **Switch**: Click any conversation in the sidebar to switch

#### Message Interaction
- Messages appear in real-time
- User messages are shown in blue on the right
- AI responses appear in gray on the left
- Each message shows the time it was sent

### For Developers

#### API Response Format

When sending a message to the external API:

**Request:**
```json
{
  "chat_id": 1,
  "message": "Your question here"
}
```

**Success Response:**
```json
{
  "success": true,
  "chat_id": 1,
  "message": "Your question here",
  "response": "AI response text",
  "chat_title": "Chat Title"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

#### Adding Custom Features

**Extend the Controller:**

```php
// Add custom method to ChatController
public function customFeature($id)
{
    $conversation = ChatConversation::findOrFail($id);
    // Your custom logic here
}
```

**Add Custom Routes:**

```php
// In routes/web.php
Route::get('/chat/{id}/custom', [ChatController::class, 'customFeature'])
    ->name('chat.custom');
```

**Modify Frontend:**

```jsx
// In Show.jsx or Index.jsx
const handleCustomAction = async () => {
    const response = await axios.get(route('chat.custom', conversation.id));
    // Handle response
};
```

## Troubleshooting

### External API Not Responding

**Error Message:** "Failed to connect to AI service"

**Solutions:**
1. Check if the external API is running: `http://localhost:5000`
2. Verify the API is authenticated (check the external API documentation)
3. Ensure no firewall is blocking port 5000
4. Check the external API logs for errors

### Connection Timeout

**Error Message:** "Request timeout"

**Solutions:**
1. The external API takes time to respond (10-120 seconds is normal)
2. Increase timeout in ChatController if needed:
```php
$response = Http::timeout(180) // Increase to 180 seconds
    ->post("{$this->externalApiUrl}/api/external/chat", [...]);
```

### Messages Not Saving

**Solutions:**
1. Check database connection
2. Verify migrations ran successfully: `php artisan migrate:status`
3. Check Laravel logs: `storage/logs/laravel.log`

### Chat Not Appearing in Navigation

**Solutions:**
1. Clear browser cache
2. Rebuild assets: `npm run build`
3. Clear Laravel cache: `php artisan cache:clear`

## Security Considerations

### Current Implementation
- All chat routes require authentication
- Users can only access their own conversations
- Messages are stored in the database
- External API communication uses HTTP (localhost only)

### Production Recommendations

1. **Use HTTPS for External API**
   ```php
   private $externalApiUrl = 'https://your-api-domain.com';
   ```

2. **Add Rate Limiting**
   ```php
   Route::middleware(['auth', 'throttle:60,1'])->group(function () {
       Route::post('/chat/{id}/message', [ChatController::class, 'sendMessage']);
   });
   ```

3. **Add Input Sanitization**
   ```php
   $request->validate([
       'message' => 'required|string|max:5000|regex:/^[\w\s\p{L}\p{N}.,!?-]+$/u',
   ]);
   ```

4. **Implement Message Filtering**
    - Add content moderation
    - Filter inappropriate content
    - Log suspicious activity

5. **Add API Authentication**
    - Use API keys or tokens
    - Implement OAuth if available
    - Rotate credentials regularly

## Performance Optimization

### Database Indexing
Already implemented:
- `user_id` index on chat_conversations
- `external_chat_id` index on chat_conversations
- `conversation_id` index on chat_messages

### Caching Recommendations

```php
// Cache conversation list
$conversations = Cache::remember("user_{$userId}_conversations", 300, function() {
    return ChatConversation::where('user_id', auth()->id())->get();
});
```

### Query Optimization

```php
// Eager load messages to reduce queries
$conversation = ChatConversation::with('messages')
    ->where('id', $id)
    ->firstOrFail();
```

## Future Enhancements

### Possible Features
1. **Message Search** - Search within conversations
2. **Export Conversations** - Download chat history
3. **Shared Conversations** - Allow multiple users to participate
4. **Message Reactions** - Like/dislike AI responses
5. **Voice Input** - Speech-to-text for messages
6. **File Attachments** - Share files with AI
7. **Code Highlighting** - Syntax highlighting for code snippets
8. **Markdown Support** - Rich text formatting
9. **Conversation Tags** - Organize conversations by topic
10. **Analytics** - Usage statistics and insights

## API Documentation Reference

For complete external API documentation, see:
- `API_INTEGRATION_GUIDE.md` - Full integration guide
- External API endpoint: `POST /api/external/chat`
- API status check: `GET /api/chats`

## Support

If you encounter issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify external API is running and authenticated
4. Test API connection: `GET /chat/api/status`
5. Review database migrations: `php artisan migrate:status`

## Credits

- Backend: Laravel 10+ with Inertia.js
- Frontend: React with Tailwind CSS
- Icons: Heroicons
- External API: DeepSeek Automation API
- HTTP Client: Laravel HTTP Client with Guzzle

---

**Last Updated:** October 29, 2025
**Version:** 1.0.0
