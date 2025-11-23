# External API Integration Guide

This guide explains how to integrate your external application (Laravel + React, Next.js, etc.) with the AI Chat Automation API.

## Base URL

```
http://localhost:5000
```

## Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/authenticate` | POST | Connect to an AI website (supports multi-connection) |
| `/api/disconnect` | POST | Disconnect from AI website(s) |
| `/api/status` | GET | Check connection status and active AI websites |
| `/api/external/chat` | POST | Send a message to a specific chat with AI website selection (supports files) |
| `/api/chats` | GET | Get all active chats for a specific AI website |
| `/api/chats/latest` | GET | Get the most recently updated chat |
| `/api/chats/sync-and-get-latest` | POST | Sync chats from AI website and return the latest one |
| `/api/generate-image` | POST | Generate an image using Gemini AI (Gemini only) |
| `/api/images` | GET | Get all generated images with optional filters |
| `/api/images/<id>` | GET | Get details of a specific image |
| `/api/images/<id>/serve` | GET | Serve the actual image file |
| `/api/images/<id>/rename` | POST | Rename an image file |
| `/api/images/<id>/move` | POST | Move an image to a different directory |
| `/api/images/<id>` | DELETE | Delete an image and its file |

## Supported AI Websites

The API currently supports:
- **DeepSeek** - AI chat with deep reasoning capabilities
- **Google Gemini** - Advanced AI with multimodal support (text, images, files)

## Authentication Flow

Before using the chat API, at least one AI website bot must be authenticated. This can be done through:
1. Web interface (recommended for initial setup)
2. Automated authentication via API (if implementing custom flows)

### Multi-Connection Support

The API now supports connecting to multiple AI websites simultaneously. Key features:

- **Simultaneous Connections**: Connect to DeepSeek and Gemini at the same time
- **Website-Specific Chats**: Each AI website maintains its own chat sessions
- **No Disconnection Required**: Switch between AI websites without disconnecting from others
- **Independent Sessions**: Each connection has its own session management

**Example Multi-Connection Flow:**
1. Connect to DeepSeek: `POST /api/authenticate` with `{"website": "deepseek"}`
2. Connect to Gemini: `POST /api/authenticate` with `{"website": "gemini"}`
3. Both connections remain active simultaneously
4. Use `website` parameter in API calls to specify which AI to use

The external API can automatically authenticate and manage multiple AI website connections.

## Authentication API Endpoint

### POST `/api/authenticate`

Connect to an AI website. This endpoint supports multiple simultaneous connections.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "website": "deepseek",
  "headless": true
}
```

**Parameters:**
- `website` (string, required): AI website to connect to ("deepseek" or "gemini")
- `headless` (boolean, optional): Run browser in headless mode (default: true)

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "website": "DeepSeek Chat"
}
```

**Error Responses:**

400 - Already Connected:
```json
{
  "success": false,
  "message": "deepseek is already connected"
}
```

404 - Website Not Found:
```json
{
  "success": false,
  "message": "AI website not found or inactive"
}
```

**Example:**
```javascript
// Connect to multiple AI websites
async function connectMultipleAI() {
  // Connect to DeepSeek
  await fetch('http://localhost:5000/api/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ website: 'deepseek', headless: true })
  });

  // Connect to Gemini (both will be active)
  await fetch('http://localhost:5000/api/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ website: 'gemini', headless: true })
  });
}
```

### POST `/api/disconnect`

Disconnect from a specific AI website or all websites.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body (Optional):**
```json
{
  "website": "deepseek"
}
```

**Parameters:**
- `website` (string, optional): Specific AI website to disconnect from. If omitted, disconnects all.

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Disconnected successfully"
}
```

### GET `/api/status`

Check authentication status and connected AI websites.

#### Response

```json
{
  "authenticated": true,
  "connected_websites": [
    {
      "name": "deepseek",
      "session_active": true
    },
    {
      "name": "gemini",
      "session_active": true
    }
  ]
}
```

## External Chat API Endpoint

### POST `/api/external/chat`

Send a message to a specific chat and receive the AI response. Supports text messages, file attachments, and automatic AI website switching.

#### Request

**For text-only messages:**

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "chat_id": 1,
  "message": "Your message here",
  "website": "deepseek"
}
```

**For messages with file attachments:**

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `chat_id` (integer, required): The database ID of the chat
- `message` (string, required): The message to send
- `website` (string, optional): AI website to use ("deepseek" or "gemini"). If not provided, uses currently connected website
- `files` (file(s), optional): One or more files to attach

**Supported File Types:**
- Documents: .epub, .mobi, .azw3, .pdf, .txt, .md, .doc, .docx, .ppt, .pptx, .xls, .xlsx
- Images: .png, .jpg, .jpeg, .svg, .gif, .webp, .bmp, .ico, .tiff
- Code: .js, .py, .java, .cpp, .c, .ts, .tsx, .jsx, .go, .php, .css, .html
- Data: .json, .csv, .tsv, .yaml, .yml, .xml
- And many more

**Parameters:**
- `chat_id` (integer, required): The database ID of the chat
- `message` (string, required): The message to send
- `website` (string, optional): AI website to use ("deepseek" or "gemini")
- `files` (file array, optional): Files to attach to the message

**Key Features:**
- Automatic website switching: If you specify a different website than currently connected, the API will automatically disconnect from the current one and authenticate with the new one
- File upload support: Attach multiple files in a single request
- Persistent sessions: Once authenticated, the session is maintained for subsequent requests

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "chat_id": 1,
  "message": "Your message here",
  "response": "AI response text",
  "chat_title": "Chat Title",
  "website": "deepseek"
}
```

**Error Responses:**

401 - Not Authenticated:
```json
{
  "success": false,
  "message": "Bot not authenticated. Please authenticate first or specify a website."
}
```

404 - AI Website Not Found:
```json
{
  "success": false,
  "message": "AI website \"chatgpt\" not found or inactive"
}
```

400 - Missing Parameters:
```json
{
  "success": false,
  "message": "chat_id and message are required"
}
```

404 - Chat Not Found:
```json
{
  "success": false,
  "message": "Chat not found"
}
```

500 - Server Error:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Integration Examples

### JavaScript/React Example

**Text-only message with AI website selection:**

```javascript
async function sendMessageToAI(chatId, message, website = 'deepseek') {
  try {
    const response = await fetch('http://localhost:5000/api/external/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message: message,
        website: website
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('AI Response:', data.response);
      console.log('Used website:', data.website);
      return data.response;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage - Send to DeepSeek
sendMessageToAI(1, 'Hello, how are you?', 'deepseek')
  .then(response => console.log(response))
  .catch(error => console.error(error));

// Usage - Send to Gemini
sendMessageToAI(1, 'Explain quantum computing', 'gemini')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

**Message with file attachments and website selection:**

```javascript
async function sendMessageWithFiles(chatId, message, files, website = 'gemini') {
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('message', message);
    formData.append('website', website);

    // Add multiple files
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch('http://localhost:5000/api/external/chat', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      console.log('AI Response:', data.response);
      console.log('Used website:', data.website);
      return data.response;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage with file input
const fileInput = document.getElementById('fileInput');
const files = fileInput.files;
sendMessageWithFiles(1, 'Can you analyze these files?', Array.from(files))
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### Laravel/PHP Example

**Text-only message with AI website selection:**

```php
<?php

function sendMessageToAI($chatId, $message, $website = 'deepseek') {
    $url = 'http://localhost:5000/api/external/chat';

    $data = [
        'chat_id' => $chatId,
        'message' => $message,
        'website' => $website
    ];

    $options = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($data)
        ]
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    if ($result === false) {
        throw new Exception('Request failed');
    }

    $response = json_decode($result, true);

    if ($response['success']) {
        echo "Used website: " . $response['website'] . "\n";
        return $response['response'];
    } else {
        throw new Exception($response['message']);
    }
}

// Usage with DeepSeek
try {
    $response = sendMessageToAI(1, 'Hello, how are you?', 'deepseek');
    echo $response;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}

// Usage with Gemini
try {
    $response = sendMessageToAI(1, 'Explain AI', 'gemini');
    echo $response;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
```

**Message with file attachments and website selection:**

```php
<?php

function sendMessageWithFiles($chatId, $message, $filePaths, $website = 'gemini') {
    $url = 'http://localhost:5000/api/external/chat';

    $curl = curl_init();

    $postData = [
        'chat_id' => $chatId,
        'message' => $message,
        'website' => $website
    ];

    // Add files
    foreach ($filePaths as $filePath) {
        if (file_exists($filePath)) {
            $postData['files[]'] = new CURLFile($filePath);
        }
    }

    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
    ]);

    $result = curl_exec($curl);
    $error = curl_error($curl);
    curl_close($curl);

    if ($error) {
        throw new Exception('Request failed: ' . $error);
    }

    $response = json_decode($result, true);

    if ($response['success']) {
        echo "Used website: " . $response['website'] . "\n";
        return $response['response'];
    } else {
        throw new Exception($response['message']);
    }
}

// Usage
try {
    $files = ['/path/to/document.pdf', '/path/to/image.png'];
    $response = sendMessageWithFiles(1, 'Can you analyze these files?', $files);
    echo $response;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
```

### Python Example

**Text-only message with AI website selection:**

```python
import requests
import json

def send_message_to_ai(chat_id, message, website='deepseek'):
    url = 'http://localhost:5000/api/external/chat'

    payload = {
        'chat_id': chat_id,
        'message': message,
        'website': website
    }

    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    if data['success']:
        print(f"Used website: {data['website']}")
        return data['response']
    else:
        raise Exception(data['message'])

# Usage with DeepSeek
try:
    response = send_message_to_ai(1, 'Hello, how are you?', 'deepseek')
    print(response)
except Exception as e:
    print(f'Error: {e}')

# Usage with Gemini
try:
    response = send_message_to_ai(1, 'Explain quantum physics', 'gemini')
    print(response)
except Exception as e:
    print(f'Error: {e}')
```

**Message with file attachments and website selection:**

```python
import requests

def send_message_with_files(chat_id, message, file_paths, website='gemini'):
    url = 'http://localhost:5000/api/external/chat'

    data = {
        'chat_id': chat_id,
        'message': message,
        'website': website
    }

    files = []
    for file_path in file_paths:
        files.append(('files', open(file_path, 'rb')))

    try:
        response = requests.post(url, data=data, files=files)
        result = response.json()

        if result['success']:
            print(f"Used website: {result['website']}")
            return result['response']
        else:
            raise Exception(result['message'])
    finally:
        # Close all opened files
        for _, file_obj in files:
            file_obj.close()

# Usage
try:
    files = ['/path/to/document.pdf', '/path/to/image.png']
    response = send_message_with_files(1, 'Can you analyze these files?', files, 'gemini')
    print(response)
except Exception as e:
    print(f'Error: {e}')
```

### cURL Example

**Text-only message with AI website selection:**

```bash
# Using DeepSeek
curl -X POST http://localhost:5000/api/external/chat \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": 1,
    "message": "Hello, how are you?",
    "website": "deepseek"
  }'

# Using Gemini
curl -X POST http://localhost:5000/api/external/chat \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": 1,
    "message": "Explain AI",
    "website": "gemini"
  }'
```

**Message with file attachments and website selection:**

```bash
curl -X POST http://localhost:5000/api/external/chat \
  -F "chat_id=1" \
  -F "message=Can you analyze these files?" \
  -F "website=gemini" \
  -F "files=@/path/to/document.pdf" \
  -F "files=@/path/to/image.png"
```

## Getting Chat IDs

You can retrieve available chats using the chats endpoint:

### GET `/api/chats`

Get all active chats from the database.

```javascript
async function getChats() {
  const response = await fetch('http://localhost:5000/api/chats');
  const data = await response.json();

  if (data.success) {
    return data.chats; // Array of chat objects with id, chat_id, title, etc.
  }
}
```

### GET `/api/chats/latest`

Get the most recently updated chat.

**Response:**
```json
{
  "success": true,
  "latest_chat": {
    "id": 5,
    "chat_id": "ad640018-bf76-4394-adc7-6c7e4217b29b",
    "chat_url": "https://chat.deepseek.com/a/chat/s/ad640018-bf76-4394-adc7-6c7e4217b29b",
    "title": "Latest Chat Title",
    "ai_website_id": 1,
    "is_active": true,
    "created_at": "2024-10-30T12:00:00",
    "updated_at": "2024-10-30T15:30:00"
  }
}
```

**Example:**
```javascript
async function getLatestChat() {
  const response = await fetch('http://localhost:5000/api/chats/latest');
  const data = await response.json();

  if (data.success) {
    return data.latest_chat;
  }
}
```

### POST `/api/chats/sync-and-get-latest`

Sync all chats from DeepSeek and return the most recently updated chat. This is useful for external applications that want to always send messages to the latest conversation.

**Request:**
No body required. The bot must be authenticated.

**Response:**
```json
{
  "success": true,
  "message": "Synced 10 chats",
  "count": 10,
  "latest_chat": {
    "id": 5,
    "chat_id": "ad640018-bf76-4394-adc7-6c7e4217b29b",
    "chat_url": "https://chat.deepseek.com/a/chat/s/ad640018-bf76-4394-adc7-6c7e4217b29b",
    "title": "Latest Chat Title",
    "ai_website_id": 1,
    "is_active": true,
    "created_at": "2024-10-30T12:00:00",
    "updated_at": "2024-10-30T15:30:00"
  }
}
```

**Example:**
```javascript
async function syncAndGetLatest() {
  const response = await fetch('http://localhost:5000/api/chats/sync-and-get-latest', {
    method: 'POST'
  });
  const data = await response.json();

  if (data.success) {
    console.log(`Synced ${data.count} chats`);
    return data.latest_chat;
  }
}

// Usage: Get the latest chat and send a message to it
async function sendToLatestChat(message) {
  const latestChat = await syncAndGetLatest();

  const response = await fetch('http://localhost:5000/api/external/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: latestChat.id,
      message: message
    })
  });

  return await response.json();
}
```

## Complete Workflow Examples

### JavaScript/React - Send to Latest Chat

```javascript
// Complete workflow: Sync chats and send a message to the latest one
async function sendMessageToLatestConversation(message, files = null) {
  try {
    // Step 1: Sync and get the latest chat
    const syncResponse = await fetch('http://localhost:5000/api/chats/sync-and-get-latest', {
      method: 'POST'
    });
    const syncData = await syncResponse.json();

    if (!syncData.success) {
      throw new Error(syncData.message);
    }

    const latestChat = syncData.latest_chat;
    console.log(`Using latest chat: ${latestChat.title} (ID: ${latestChat.id})`);

    // Step 2: Send message to the latest chat
    let chatResponse;

    if (files && files.length > 0) {
      // Send with files
      const formData = new FormData();
      formData.append('chat_id', latestChat.id);
      formData.append('message', message);
      files.forEach(file => formData.append('files', file));

      chatResponse = await fetch('http://localhost:5000/api/external/chat', {
        method: 'POST',
        body: formData
      });
    } else {
      // Send text only
      chatResponse = await fetch('http://localhost:5000/api/external/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: latestChat.id,
          message: message
        })
      });
    }

    const chatData = await chatResponse.json();

    if (chatData.success) {
      return {
        success: true,
        chat: latestChat,
        response: chatData.response
      };
    } else {
      throw new Error(chatData.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
sendMessageToLatestConversation('Hello, what can you help me with?')
  .then(result => {
    console.log('Chat:', result.chat.title);
    console.log('AI Response:', result.response);
  })
  .catch(error => console.error('Failed:', error));
```

### Python - Send to Latest Chat

```python
import requests

def send_message_to_latest_conversation(message, file_paths=None):
    """
    Sync chats and send a message to the latest conversation.

    Args:
        message (str): The message to send
        file_paths (list): Optional list of file paths to attach

    Returns:
        dict: Response containing chat info and AI response
    """
    base_url = 'http://localhost:5000'

    try:
        # Step 1: Sync and get the latest chat
        sync_response = requests.post(f'{base_url}/api/chats/sync-and-get-latest')
        sync_data = sync_response.json()

        if not sync_data['success']:
            raise Exception(sync_data['message'])

        latest_chat = sync_data['latest_chat']
        print(f"Using latest chat: {latest_chat['title']} (ID: {latest_chat['id']})")

        # Step 2: Send message to the latest chat
        if file_paths:
            # Send with files
            data = {
                'chat_id': latest_chat['id'],
                'message': message
            }
            files = [('files', open(fp, 'rb')) for fp in file_paths]

            try:
                chat_response = requests.post(f'{base_url}/api/external/chat', data=data, files=files)
            finally:
                for _, file_obj in files:
                    file_obj.close()
        else:
            # Send text only
            chat_response = requests.post(
                f'{base_url}/api/external/chat',
                json={
                    'chat_id': latest_chat['id'],
                    'message': message
                }
            )

        chat_data = chat_response.json()

        if chat_data['success']:
            return {
                'success': True,
                'chat': latest_chat,
                'response': chat_data['response']
            }
        else:
            raise Exception(chat_data['message'])

    except Exception as e:
        print(f'Error: {e}')
        raise

# Usage
try:
    result = send_message_to_latest_conversation('Hello, what can you help me with?')
    print(f"Chat: {result['chat']['title']}")
    print(f"AI Response: {result['response']}")
except Exception as e:
    print(f'Failed: {e}')
```

### PHP - Send to Latest Chat

```php
<?php

function sendMessageToLatestConversation($message, $filePaths = null) {
    $baseUrl = 'http://localhost:5000';

    // Step 1: Sync and get the latest chat
    $syncResponse = file_get_contents($baseUrl . '/api/chats/sync-and-get-latest', false, stream_context_create([
        'http' => ['method' => 'POST']
    ]));

    $syncData = json_decode($syncResponse, true);

    if (!$syncData['success']) {
        throw new Exception($syncData['message']);
    }

    $latestChat = $syncData['latest_chat'];
    echo "Using latest chat: {$latestChat['title']} (ID: {$latestChat['id']})\n";

    // Step 2: Send message to the latest chat
    $curl = curl_init();

    if ($filePaths && count($filePaths) > 0) {
        // Send with files
        $postData = [
            'chat_id' => $latestChat['id'],
            'message' => $message
        ];

        foreach ($filePaths as $filePath) {
            if (file_exists($filePath)) {
                $postData['files[]'] = new CURLFile($filePath);
            }
        }

        curl_setopt_array($curl, [
            CURLOPT_URL => $baseUrl . '/api/external/chat',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
        ]);
    } else {
        // Send text only
        curl_setopt_array($curl, [
            CURLOPT_URL => $baseUrl . '/api/external/chat',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode([
                'chat_id' => $latestChat['id'],
                'message' => $message
            ])
        ]);
    }

    $chatResponse = curl_exec($curl);
    $error = curl_error($curl);
    curl_close($curl);

    if ($error) {
        throw new Exception('Request failed: ' . $error);
    }

    $chatData = json_decode($chatResponse, true);

    if ($chatData['success']) {
        return [
            'success' => true,
            'chat' => $latestChat,
            'response' => $chatData['response']
        ];
    } else {
        throw new Exception($chatData['message']);
    }
}

// Usage
try {
    $result = sendMessageToLatestConversation('Hello, what can you help me with?');
    echo "Chat: {$result['chat']['title']}\n";
    echo "AI Response: {$result['response']}\n";
} catch (Exception $e) {
    echo "Failed: {$e->getMessage()}\n";
}

?>
```

### cURL - Send to Latest Chat

```bash
#!/bin/bash

# Step 1: Sync and get the latest chat
SYNC_RESPONSE=$(curl -s -X POST http://localhost:5000/api/chats/sync-and-get-latest)
CHAT_ID=$(echo $SYNC_RESPONSE | jq -r '.latest_chat.id')

echo "Using chat ID: $CHAT_ID"

# Step 2: Send message to the latest chat
curl -X POST http://localhost:5000/api/external/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": $CHAT_ID,
    \"message\": \"Hello, what can you help me with?\"
  }"
```

## Testing Locally

### Step 1: Start the Backend Server

```bash
cd backend
python app.py
```

The server will start on `http://localhost:5000`

### Step 2: Authenticate the Bot

Open the web interface at `http://localhost:5173` and:
1. Select DeepSeek website
2. Click "Connect" to authenticate
3. Wait for authentication to complete

### Step 3: Get a Chat ID

Option A - Use the web interface:
1. Sync chats or create a new chat
2. Note the chat ID from the database or browser console

Option B - Use the API:
```bash
curl http://localhost:5000/api/chats
```

### Step 4: Test the External API

Create a test file `test_api.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Test</title>
</head>
<body>
  <h1>DeepSeek API Test</h1>

  <div>
    <label>Chat ID: <input type="number" id="chatId" value="1"></label><br><br>
    <label>Message: <input type="text" id="message" value="Hello!"></label><br><br>
    <button onclick="testAPI()">Send Message</button>
  </div>

  <div id="result" style="margin-top: 20px;"></div>

  <script>
    async function testAPI() {
      const chatId = document.getElementById('chatId').value;
      const message = document.getElementById('message').value;
      const resultDiv = document.getElementById('result');

      resultDiv.innerHTML = 'Sending...';

      try {
        const response = await fetch('http://localhost:5000/api/external/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: parseInt(chatId),
            message: message
          })
        });

        const data = await response.json();

        if (data.success) {
          resultDiv.innerHTML = `
            <h3>Success!</h3>
            <p><strong>Response:</strong> ${data.response}</p>
            <p><strong>Chat:</strong> ${data.chat_title}</p>
          `;
        } else {
          resultDiv.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
        }
      } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      }
    }
  </script>
</body>
</html>
```

Open this file in your browser and test the API.

## Practical Use Cases

### Use Case 1: Laravel Application with Mixed AI Providers

```php
// In your Laravel controller
public function askAI(Request $request) {
    $question = $request->input('question');
    $useGemini = $request->input('use_gemini', false);
    $chatId = $request->input('chat_id', 1);

    // Choose AI based on task
    $website = $useGemini ? 'gemini' : 'deepseek';

    $response = Http::post('http://localhost:5000/api/external/chat', [
        'chat_id' => $chatId,
        'message' => $question,
        'website' => $website
    ]);

    if ($response->successful()) {
        $data = $response->json();
        return response()->json([
            'answer' => $data['response'],
            'provider' => $data['website']
        ]);
    }

    return response()->json(['error' => 'Failed to get AI response'], 500);
}
```

### Use Case 2: React App with Dynamic AI Selection

```javascript
// React component
function AIChat() {
  const [aiProvider, setAiProvider] = useState('deepseek');

  const sendMessage = async (message, files = []) => {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('message', message);
    formData.append('website', aiProvider);

    files.forEach(file => formData.append('files', file));

    const response = await fetch('http://localhost:5000/api/external/chat', {
      method: 'POST',
      body: formData
    });

    return await response.json();
  };

  return (
    <div>
      <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
        <option value="deepseek">DeepSeek (Logic & Reasoning)</option>
        <option value="gemini">Gemini (Multimodal)</option>
      </select>
      {/* Rest of your chat UI */}
    </div>
  );
}
```

### Use Case 3: Automatic AI Selection Based on Task Type

```python
def smart_ai_query(chat_id, message, files=None):
    """
    Automatically choose the best AI based on the task
    """
    # Use Gemini for file analysis and visual tasks
    if files:
        website = 'gemini'
    # Use Gemini for image-related requests
    elif any(word in message.lower() for word in ['image', 'picture', 'photo', 'visual']):
        website = 'gemini'
    # Use DeepSeek for complex reasoning
    elif any(word in message.lower() for word in ['analyze', 'reason', 'logic', 'calculate']):
        website = 'deepseek'
    else:
        website = 'deepseek'  # Default

    url = 'http://localhost:5000/api/external/chat'

    if files:
        data = {'chat_id': chat_id, 'message': message, 'website': website}
        file_objects = [('files', open(f, 'rb')) for f in files]
        response = requests.post(url, data=data, files=file_objects)
        for _, f in file_objects:
            f.close()
    else:
        response = requests.post(url, json={
            'chat_id': chat_id,
            'message': message,
            'website': website
        })

    return response.json()
```

## Multi-Connection Advanced Examples

### Use Case 4: Parallel AI Processing

Query multiple AI websites simultaneously for comparison or redundancy:

```javascript
async function queryMultipleAIs(chatIds, message) {
  // Assuming both DeepSeek and Gemini are already connected

  const promises = [
    fetch('http://localhost:5000/api/external/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatIds.deepseek,
        message: message,
        website: 'deepseek'
      })
    }),
    fetch('http://localhost:5000/api/external/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatIds.gemini,
        message: message,
        website: 'gemini'
      })
    })
  ];

  const [deepseekResponse, geminiResponse] = await Promise.all(promises);
  const [deepseekData, geminiData] = await Promise.all([
    deepseekResponse.json(),
    geminiResponse.json()
  ]);

  return {
    deepseek: deepseekData.response,
    gemini: geminiData.response
  };
}

// Usage
const responses = await queryMultipleAIs(
  { deepseek: 1, gemini: 2 },
  'Explain quantum computing in simple terms'
);

console.log('DeepSeek:', responses.deepseek);
console.log('Gemini:', responses.gemini);
```

### Use Case 5: Full Multi-Connection Workflow

Complete example showing connection, chat management, and messaging across multiple AI websites:

```python
import requests

class MultiAIClient:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.connections = {}

    def connect(self, website, headless=True):
        """Connect to an AI website"""
        response = requests.post(
            f'{self.base_url}/api/authenticate',
            json={'website': website, 'headless': headless}
        )
        data = response.json()
        if data['success']:
            self.connections[website] = True
            print(f"Connected to {website}")
        return data

    def get_status(self):
        """Get current connection status"""
        response = requests.get(f'{self.base_url}/api/status')
        return response.json()

    def sync_chats(self, website):
        """Sync chats for a specific website"""
        response = requests.post(
            f'{self.base_url}/api/chats/sync-and-get-latest',
            json={'website': website}
        )
        return response.json()

    def send_message(self, website, chat_id, message, files=None):
        """Send message to specific AI website"""
        if files:
            data = {
                'chat_id': chat_id,
                'message': message,
                'website': website
            }
            file_objects = [('files', open(f, 'rb')) for f in files]
            response = requests.post(
                f'{self.base_url}/api/external/chat',
                data=data,
                files=file_objects
            )
            for _, f in file_objects:
                f.close()
        else:
            response = requests.post(
                f'{self.base_url}/api/external/chat',
                json={
                    'chat_id': chat_id,
                    'message': message,
                    'website': website
                }
            )
        return response.json()

    def disconnect(self, website=None):
        """Disconnect from specific website or all"""
        body = {'website': website} if website else {}
        response = requests.post(
            f'{self.base_url}/api/disconnect',
            json=body
        )
        if website:
            self.connections.pop(website, None)
        else:
            self.connections.clear()
        return response.json()

# Complete workflow example
client = MultiAIClient()

# Step 1: Connect to multiple AI websites
client.connect('deepseek')
client.connect('gemini')

# Step 2: Check status
status = client.get_status()
print(f"Connected to: {[w['name'] for w in status['connected_websites']]}")

# Step 3: Sync chats for both
deepseek_chat = client.sync_chats('deepseek')
gemini_chat = client.sync_chats('gemini')

# Step 4: Send messages to different AIs
deepseek_response = client.send_message(
    'deepseek',
    deepseek_chat['latest_chat']['id'],
    'Analyze this complex algorithm'
)

gemini_response = client.send_message(
    'gemini',
    gemini_chat['latest_chat']['id'],
    'Generate a diagram for this concept',
    files=['/path/to/document.pdf']
)

print('DeepSeek:', deepseek_response['response'])
print('Gemini:', gemini_response['response'])

# Step 5: Disconnect when done
client.disconnect()  # Disconnect all
```

## Important Notes

1. **Multi-Connection Support**: NEW - Connect to multiple AI websites simultaneously without disconnecting
2. **Website-Specific Operations**: Each API call can target a specific AI website using the `website` parameter
3. **Independent Sessions**: Each AI website maintains its own session, chats, and state
4. **One Request at a Time Per Website**: Each bot processes one message at a time, but different bots can process simultaneously
5. **Response Time**: Responses can take 10-120 seconds depending on the AI's response length
6. **Error Handling**: Always handle errors appropriately in your application
7. **Production**: For production use, implement proper authentication/authorization for the external API endpoint
8. **File Uploads**: Files are temporarily stored on the server and automatically deleted after processing
9. **File Size**: Be mindful of file sizes when uploading; large files may increase processing time
10. **Supported Formats**: Only files with allowed extensions can be uploaded (see supported file types list above)
11. **Multimodal Support**: Gemini supports both text and files simultaneously, making it ideal for document analysis
12. **Connection Management**: Use `/api/status` to check which AI websites are currently connected

## Production Deployment

For production deployment:

1. **Add API Authentication**: Implement API keys or OAuth
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **CORS Configuration**: Configure CORS properly for your domain
4. **HTTPS**: Use HTTPS for secure communication
5. **Error Logging**: Implement proper error logging
6. **Queue System**: Consider implementing a queue system for handling multiple requests

Example with API key authentication:

```python
@app.route('/api/external/chat', methods=['POST'])
def external_chat():
    api_key = request.headers.get('X-API-Key')

    if not api_key or api_key != os.getenv('API_KEY'):
        return jsonify({
            'success': False,
            'message': 'Invalid API key'
        }), 401

    # Rest of the code...
```

## Image Generation API (Gemini Only)

### POST `/api/generate-image`

Generate an image using Google Gemini AI. This endpoint sends a description to Gemini, waits for the image to be generated, downloads it, and stores it in your configured download path.

**Request:**

```json
{
  "description": "A beautiful sunset over mountains",
  "chat_id": 1
}
```

**Parameters:**
- `description` (string, required): The image description/prompt
- `chat_id` (integer, optional): Associate image with a specific chat

**Response (Success):**

```json
{
  "success": true,
  "description": "A beautiful sunset over mountains",
  "response": "AI text response about the generated image",
  "image_id": 5,
  "image_filename": "gemini_generated_a3b4c5d6.png",
  "image_path": "/home/user/Downloads/gemini_generated_a3b4c5d6.png"
}
```

**Example Usage:**

```javascript
const response = await fetch('http://localhost:5000/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: 'A serene lake surrounded by pine trees',
    chat_id: 1
  })
});

const data = await response.json();
if (data.success && data.image_id) {
  console.log('Image saved to:', data.image_path);
  console.log('Access via API:', `/api/images/${data.image_id}/serve`);
}
```

## Image Management API

### GET `/api/images`

Retrieve all generated images with optional filtering.

**Query Parameters:**
- `chat_id` (integer, optional): Filter by chat ID
- `ai_website` (string, optional): Filter by AI website name (e.g., "gemini")

**Response:**

```json
{
  "success": true,
  "images": [
    {
      "id": 1,
      "chat_id": 1,
      "ai_website_id": 2,
      "ai_website_name": "Google Gemini",
      "description": "A beautiful sunset",
      "original_filename": "gemini_generated_a3b4c5d6.png",
      "stored_filename": "gemini_generated_a3b4c5d6.png",
      "file_path": "/home/user/Downloads/gemini_generated_a3b4c5d6.png",
      "file_size": 245678,
      "mime_type": "image/png",
      "width": 1024,
      "height": 1024,
      "created_at": "2025-11-01T10:30:00",
      "updated_at": "2025-11-01T10:30:00"
    }
  ]
}
```

**Example:**

```javascript
// Get all images
const allImages = await fetch('http://localhost:5000/api/images');

// Get images for specific chat
const chatImages = await fetch('http://localhost:5000/api/images?chat_id=1');

// Get images from Gemini only
const geminiImages = await fetch('http://localhost:5000/api/images?ai_website=gemini');
```

### GET `/api/images/<id>`

Get detailed information about a specific image.

**Response:**

```json
{
  "success": true,
  "image": {
    "id": 1,
    "description": "A beautiful sunset",
    "stored_filename": "gemini_generated_a3b4c5d6.png",
    "file_path": "/home/user/Downloads/gemini_generated_a3b4c5d6.png",
    "file_size": 245678,
    "width": 1024,
    "height": 1024,
    "created_at": "2025-11-01T10:30:00"
  }
}
```

### GET `/api/images/<id>/serve`

Serve the actual image file. This endpoint returns the binary image data.

**Example:**

```html
<img src="http://localhost:5000/api/images/1/serve" alt="Generated Image" />
```

### POST `/api/images/<id>/rename`

Rename an image file.

**Request:**

```json
{
  "new_filename": "my_sunset_image"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Image renamed successfully",
  "new_filename": "my_sunset_image.png",
  "new_path": "/home/user/Downloads/my_sunset_image.png"
}
```

**Example:**

```javascript
await fetch('http://localhost:5000/api/images/1/rename', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ new_filename: 'beautiful_sunset' })
});
```

### POST `/api/images/<id>/move`

Move an image to a different directory.

**Request:**

```json
{
  "new_directory": "/home/user/Pictures/AI-Generated"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Image moved successfully",
  "new_path": "/home/user/Pictures/AI-Generated/gemini_generated_a3b4c5d6.png"
}
```

**Example:**

```javascript
await fetch('http://localhost:5000/api/images/1/move', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ new_directory: '/home/user/Pictures' })
});
```

### DELETE `/api/images/<id>`

Delete an image from both the database and filesystem.

**Response:**

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Example:**

```javascript
await fetch('http://localhost:5000/api/images/1', {
  method: 'DELETE'
});
```

## Complete Workflow Example

Here's a complete example of generating an image and managing it:

```javascript
async function generateAndManageImage() {
  // 1. Generate image
  const genResponse = await fetch('http://localhost:5000/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'A futuristic city at night',
      chat_id: 1
    })
  });

  const genData = await genResponse.json();
  console.log('Image generated:', genData.image_filename);

  const imageId = genData.image_id;

  // 2. Display image
  const imgElement = document.createElement('img');
  imgElement.src = `http://localhost:5000/api/images/${imageId}/serve`;
  document.body.appendChild(imgElement);

  // 3. Rename image
  await fetch(`http://localhost:5000/api/images/${imageId}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_filename: 'futuristic_city' })
  });

  // 4. Move to organized folder
  await fetch(`http://localhost:5000/api/images/${imageId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_directory: '/home/user/Pictures/AI-Art' })
  });

  // 5. Get updated info
  const infoResponse = await fetch(`http://localhost:5000/api/images/${imageId}`);
  const infoData = await infoResponse.json();
  console.log('Final path:', infoData.image.file_path);
}
```

## Image Storage Configuration

By default, images are saved to the user's Downloads folder. You can configure a custom download path:

**Via Settings API:**

```javascript
await fetch('http://localhost:5000/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    download_path: '/home/user/Pictures/AI-Generated'
  })
});
```

**Via Web Interface:**
Navigate to Settings tab and update the "Image Download Path" field.

## Support

For issues or questions, check the project documentation or create an issue in the repository.
