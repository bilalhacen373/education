# External API Integration Guide

This guide explains how to integrate your external application (Laravel + React, Next.js, etc.) with the AI Chat Automation API. The API supports multiple AI services (DeepSeek, Google Gemini, and Qwen) with automatic authentication and session management.

## Base URL

```
https://ai.server.3ilme.com
```

## Quick Reference

### Core Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/authenticate` | POST | Connect to an AI website (supports multi-connection) |
| `/api/disconnect` | POST | Disconnect from AI website(s) |
| `/api/status` | GET | Check connection status and active AI websites |

### External API Endpoints (Recommended)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/external/website-status` | GET | Check if website is connected, optionally get all connections |
| `/api/external/website-select` | POST | Select and authenticate with a specific AI website |
| `/api/external/chat-list` | GET | Get all chats for a specific website |
| `/api/external/chat` | POST | Send message to chat with automatic website handling |
| `/api/external/chat-navigate` | POST | Navigate to specific chat |
| `/api/external/chat-create` | POST | Create new chat for website |
| `/api/external/generate-image` | POST | Generate image using Gemini or Qwen |

### Chat Management Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chats` | GET | Get all active chats for a website |
| `/api/chats/latest` | GET | Get most recently updated chat |
| `/api/chats/sync` | POST | Sync chats from AI website |
| `/api/chats/sync-and-get-latest` | POST | Sync and return latest chat |
| `/api/chats/create` | POST | Create new chat |
| `/api/chats/<id>/navigate` | POST | Navigate to chat by ID |

### Image Management Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-image` | POST | Generate image (internal) |
| `/api/images` | GET | Get all generated images |
| `/api/images/<id>` | GET | Get image details |
| `/api/images/<id>/serve` | GET | Serve image file |
| `/api/images/<id>/rename` | POST | Rename image file |
| `/api/images/<id>/move` | POST | Move image to directory |
| `/api/images/<id>` | DELETE | Delete image |

## Supported AI Websites

The API supports three AI services:

- **DeepSeek** - Advanced reasoning AI chat with deep thinking capabilities
- **Google Gemini** - Multimodal AI with text, images, and file support
- **Qwen** - Alibaba's AI with strong image generation capabilities

### Service Capabilities

| Feature | DeepSeek | Gemini | Qwen |
|---------|----------|--------|------|
| Chat | ✅ | ✅ | ✅ |
| File Attachments | ✅ | ✅ | Planned |
| Image Generation | ❌ | ✅ | ✅ |
| Image Download | N/A | ✅ | ✅ |

## External API Workflow Requirements

The external API follows a specific workflow pattern optimized for integration with Laravel, React, and other external applications:

### Standard Workflow: Select Website → Navigate → Perform Action

```
1. Check website connection status
   ↓
2. Select/connect to desired website (auto-authenticates if needed)
   ↓
3. Get chat list or create new chat
   ↓
4. Navigate to specific chat
   ↓
5. Perform action (send message, generate image, etc.)
```

### GUI Workflow vs External API Workflow

**GUI Workflow (Internal):**
- User manually connects to website in UI
- Session persists across multiple operations
- Single website active at a time

**External API Workflow (Recommended):**
- Each request specifies the website
- Automatic authentication on first use
- Automatic session management
- No disconnection needed between requests
- Multi-website support in parallel

## Authentication

### POST `/api/authenticate`

Connect to an AI website for internal/GUI usage. This endpoint supports multiple simultaneous connections.

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
- `website` (string, required): AI website to connect to ("deepseek", "gemini", or "qwen")
- `headless` (boolean, optional): Run browser in headless mode (default: true)

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "website": "DeepSeek Chat",
  "website_name": "deepseek"
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

#### Example

```javascript
// Connect to DeepSeek
async function authenticate() {
  const response = await fetch(`https://ai.server.3ilme.com/api/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      website: 'deepseek',
      headless: true
    })
  });
  const data = await response.json();
  return data;
}
```

### POST `/api/disconnect`

Disconnect from a specific AI website or all websites.

#### Request

**Body (Optional):**
```json
{
  "website": "deepseek"
}
```

**Parameters:**
- `website` (string, optional): Specific website to disconnect from. Omit to disconnect all.

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Disconnected from deepseek"
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

## External API - Website Management

### GET `/api/external/website-status`

Check if a website is connected or get all connections.

#### Request

**Parameters:**
- `website` (string, optional): Specific website name to check. Omit for all connections.

#### Response

**Single Website Query:**
```json
{
  "success": true,
  "website": "gemini",
  "connected": true,
  "session_active": true
}
```

**All Connections Query:**
```json
{
  "success": true,
  "connected_websites": [
    {
      "name": "deepseek",
      "connected": true,
      "session_active": true
    },
    {
      "name": "gemini",
      "connected": true,
      "session_active": true
    }
  ],
  "total_connected": 2
}
```

#### Example

```javascript
// Check if Gemini is connected
async function checkWebsiteStatus() {
  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/website-status?website=gemini'
  );
  const data = await response.json();
  console.log(data.connected); // true or false
  return data;
}
```

### POST `/api/external/website-select`

Select and authenticate with a specific AI website. Automatically authenticates if not already connected.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "website": "qwen"
}
```

**Parameters:**
- `website` (string, required): Website to connect to ("deepseek", "gemini", or "qwen")

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully connected to qwen",
  "website": "qwen",
  "display_name": "Qwen AI",
  "connected": true
}
```

**Error Response - Already Connected (200):**
```json
{
  "success": true,
  "message": "qwen is already connected",
  "website": "qwen",
  "connected": true
}
```

#### Example

```javascript
// Select Qwen for image generation
async function selectWebsite(websiteName) {
  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/website-select',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website: websiteName })
    }
  );
  const data = await response.json();
  if (data.success) {
    console.log(`Connected to ${data.display_name}`);
  }
  return data;
}
```

## External API - Chat Management

### GET `/api/external/chat-list`

Get all chats for a specific website.

#### Request

**Parameters:**
- `website` (string, required): Website name ("deepseek", "gemini", or "qwen")

#### Response

```json
{
  "success": true,
  "chats": [
    {
      "id": 1,
      "chat_id": "abc123",
      "chat_url": "https://chat.deepseek.com/a/chat/s/abc123",
      "title": "Project Discussion",
      "ai_website_id": 1,
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T15:30:00Z"
    }
  ],
  "website": "deepseek",
  "total": 1
}
```

#### Example

```javascript
async function getChatList(website) {
  const response = await fetch(
    `https://ai.server.3ilme.com/api/external/chat-list?website=${website}`
  );
  const data = await response.json();
  return data.chats;
}
```

### POST `/api/external/chat-navigate`

Navigate to a specific chat.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "chat_id": 1,
  "website": "deepseek"
}
```

**Parameters:**
- `chat_id` (integer, required): Database chat ID
- `website` (string, required): Website name

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Navigated to chat successfully",
  "chat": {
    "id": 1,
    "chat_id": "abc123",
    "chat_url": "https://chat.deepseek.com/a/chat/s/abc123",
    "title": "Project Discussion"
  },
  "website": "deepseek"
}
```

#### Example

```javascript
async function navigateToChat(chatId, website) {
  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/chat-navigate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, website })
    }
  );
  return await response.json();
}
```

### POST `/api/external/chat-create`

Create a new chat for a website. Automatically authenticates if needed.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "website": "gemini"
}
```

**Parameters:**
- `website` (string, required): Website name

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "chat": {
    "id": 5,
    "chat_id": "new_chat",
    "chat_url": "https://gemini.google.com/app",
    "title": "New Chat"
  },
  "website": "gemini"
}
```

#### Example

```javascript
async function createNewChat(website) {
  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/chat-create',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website })
    }
  );
  return await response.json();
}
```

## External API - Chat Messages

### POST `/api/external/chat`

Send a message to a specific chat. Automatically handles website authentication and navigation.

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
  "message": "Explain quantum computing",
  "website": "deepseek"
}
```

**For messages with file attachments:**

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `chat_id` (integer, required): Database chat ID
- `message` (string, required): Message text
- `website` (string, required): Website name
- `files` (file(s), optional): Attached files

**Supported File Types:**
- Documents: .pdf, .txt, .md, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .epub, .mobi, .azw3
- Images: .png, .jpg, .jpeg, .svg, .gif, .webp, .bmp, .ico, .tiff
- Code: .js, .py, .java, .cpp, .c, .ts, .tsx, .jsx, .go, .php, .css, .html
- Data: .json, .csv, .tsv, .yaml, .yml, .xml, .ini, .conf, .log, .dot

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "chat_id": 1,
  "message": "Explain quantum computing",
  "response": "Quantum computing is a revolutionary approach to computation...",
  "chat_title": "Science Discussion",
  "website": "deepseek"
}
```

**Error Responses:**

404 - Chat Not Found:
```json
{
  "success": false,
  "message": "Chat not found"
}
```

500 - Navigation Failed:
```json
{
  "success": false,
  "message": "Failed to navigate to chat"
}
```

#### Example

```javascript
// Send message with automatic website handling
async function sendMessage(chatId, message, website) {
  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message,
        website
      })
    }
  );
  const data = await response.json();
  return data.response;
}

// Send message with file
async function sendMessageWithFile(chatId, message, website, file) {
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('message', message);
  formData.append('website', website);
  formData.append('files', file);

  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/chat',
    {
      method: 'POST',
      body: formData
    }
  );
  const data = await response.json();
  return data.response;
}
```

## External API - Image Generation

### POST `/api/external/generate-image`

Generate images using Gemini or Qwen AI. Automatically handles authentication and navigation.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "description": "A serene mountain landscape at sunset",
  "website": "gemini",
  "chat_id": 1
}
```

**Parameters:**
- `description` (string, required): Image prompt/description
- `website` (string, required): "gemini" or "qwen"
- `chat_id` (integer, optional): Navigate to specific chat before generation

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "description": "A serene mountain landscape at sunset",
  "response": "I've generated an image based on your description...",
  "image_id": 42,
  "image_filename": "Gemini_Generated_Image_abc123.png",
  "image_path": "/path/to/backend/downloaded_files/Gemini_Generated_Image_abc123.png",
  "website": "gemini",
  "chat_id": 1
}
```

**Error Response - Invalid Website:**
```json
{
  "success": false,
  "message": "Image generation is only available for Gemini or Qwen"
}
```

#### Example

```javascript
// Generate image with Gemini
async function generateImage(description, website = 'gemini', chatId = null) {
  const response = await fetch(
    'https://ai.server.3ilme.com/api/external/generate-image',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        website,
        chat_id: chatId
      })
    }
  );
  const data = await response.json();
  if (data.success) {
    console.log(`Image saved: ${data.image_filename}`);
  }
  return data;
}

// Generate image with Qwen
async function generateImageWithQwen(description, chatId = null) {
  return generateImage(description, 'qwen', chatId);
}
```

## Integration Examples

### Complete Workflow: JavaScript/React

```javascript
class AIIntegrationClient {
  constructor(baseUrl = 'https://ai.server.3ilme.com') {
    this.baseUrl = baseUrl;
  }

  async checkStatus(website = null) {
    const url = website
      ? `${this.baseUrl}/api/external/website-status?website=${website}`
      : `${this.baseUrl}/api/external/website-status`;
    const response = await fetch(url);
    return await response.json();
  }

  async selectWebsite(website) {
    const response = await fetch(
      `${this.baseUrl}/api/external/website-select`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website })
      }
    );
    return await response.json();
  }

  async getChatList(website) {
    const response = await fetch(
      `${this.baseUrl}/api/external/chat-list?website=${website}`
    );
    return await response.json();
  }

  async createChat(website) {
    const response = await fetch(
      `${this.baseUrl}/api/external/chat-create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website })
      }
    );
    return await response.json();
  }

  async sendMessage(chatId, message, website) {
    const response = await fetch(
      `${this.baseUrl}/api/external/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message,
          website
        })
      }
    );
    return await response.json();
  }

  async generateImage(description, website, chatId = null) {
    const response = await fetch(
      `${this.baseUrl}/api/external/generate-image`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          website,
          chat_id: chatId
        })
      }
    );
    return await response.json();
  }
}

// Usage
const client = new AIIntegrationClient();

async function completeWorkflow() {
  try {
    // 1. Select Gemini
    console.log('Selecting Gemini...');
    await client.selectWebsite('gemini');

    // 2. Get or create chat
    let chatList = await client.getChatList('gemini');
    let chatId = chatList.chats.length > 0
      ? chatList.chats[0].id
      : (await client.createChat('gemini')).chat.id;

    // 3. Send message
    console.log('Sending message...');
    const result = await client.sendMessage(
      chatId,
      'What is the future of AI?',
      'gemini'
    );
    console.log('Response:', result.response);

    // 4. Generate image
    console.log('Generating image...');
    const imageResult = await client.generateImage(
      'A futuristic AI lab',
      'gemini',
      chatId
    );
    console.log('Image saved:', imageResult.image_filename);

  } catch (error) {
    console.error('Error:', error);
  }
}

completeWorkflow();
```

### PHP/Laravel Example

```php
class AIIntegrationService {
    private $baseUrl = 'https://ai.server.3ilme.com';

    public function selectWebsite($website) {
        return $this->post('/api/external/website-select', [
            'website' => $website
        ]);
    }

    public function getChatList($website) {
        return $this->get("/api/external/chat-list?website={$website}");
    }

    public function createChat($website) {
        return $this->post('/api/external/chat-create', [
            'website' => $website
        ]);
    }

    public function sendMessage($chatId, $message, $website) {
        return $this->post('/api/external/chat', [
            'chat_id' => $chatId,
            'message' => $message,
            'website' => $website
        ]);
    }

    public function generateImage($description, $website, $chatId = null) {
        return $this->post('/api/external/generate-image', [
            'description' => $description,
            'website' => $website,
            'chat_id' => $chatId
        ]);
    }

    private function get($endpoint) {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }

    private function post($endpoint, $data) {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }
}

// Usage
$client = new AIIntegrationService();

// Select website
$client->selectWebsite('deepseek');

// Get chats or create new one
$chats = $client->getChatList('deepseek');
$chatId = !empty($chats['chats'])
    ? $chats['chats'][0]['id']
    : $client->createChat('deepseek')['chat']['id'];

// Send message
$result = $client->sendMessage(
    $chatId,
    'Explain machine learning',
    'deepseek'
);
echo $result['response'];
```

### Python Example

```python
import requests

class AIIntegrationClient:
    def __init__(self, base_url='https://ai.server.3ilme.com'):
        self.base_url = base_url

    def select_website(self, website):
        response = requests.post(
            f'{self.base_url}/api/external/website-select',
            json={'website': website}
        )
        return response.json()

    def get_chat_list(self, website):
        response = requests.get(
            f'{self.base_url}/api/external/chat-list',
            params={'website': website}
        )
        return response.json()

    def create_chat(self, website):
        response = requests.post(
            f'{self.base_url}/api/external/chat-create',
            json={'website': website}
        )
        return response.json()

    def send_message(self, chat_id, message, website):
        response = requests.post(
            f'{self.base_url}/api/external/chat',
            json={
                'chat_id': chat_id,
                'message': message,
                'website': website
            }
        )
        return response.json()

    def generate_image(self, description, website, chat_id=None):
        response = requests.post(
            f'{self.base_url}/api/external/generate-image',
            json={
                'description': description,
                'website': website,
                'chat_id': chat_id
            }
        )
        return response.json()

# Usage
client = AIIntegrationClient()

# Select Qwen for image generation
client.select_website('qwen')

# Get chats
chats = client.get_chat_list('qwen')
chat_id = chats['chats'][0]['id'] if chats['chats'] else \
          client.create_chat('qwen')['chat']['id']

# Send message
result = client.send_message(chat_id, 'Hello Qwen!', 'qwen')
print(result['response'])

# Generate image
image_result = client.generate_image(
    'A beautiful sunset',
    'qwen',
    chat_id
)
print(f"Image saved: {image_result['image_filename']}")
```

### cURL Examples

```bash
# Check website status
curl -X GET "https://ai.server.3ilme.com/api/external/website-status?website=gemini"

# Select website
curl -X POST "https://ai.server.3ilme.com/api/external/website-select" \
  -H "Content-Type: application/json" \
  -d '{"website": "deepseek"}'

# Get chat list
curl -X GET "https://ai.server.3ilme.com/api/external/chat-list?website=gemini"

# Create new chat
curl -X POST "https://ai.server.3ilme.com/api/external/chat-create" \
  -H "Content-Type: application/json" \
  -d '{"website": "qwen"}'

# Send message
curl -X POST "https://ai.server.3ilme.com/api/external/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": 1,
    "message": "Hello AI",
    "website": "deepseek"
  }'

# Generate image with Gemini
curl -X POST "https://ai.server.3ilme.com/api/external/generate-image" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A mountain landscape",
    "website": "gemini"
  }'

# Generate image with Qwen
curl -X POST "https://ai.server.3ilme.com/api/external/generate-image" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A cyberpunk city",
    "website": "qwen"
  }'

# Send message with file
curl -X POST "https://ai.server.3ilme.com/api/external/chat" \
  -F "chat_id=1" \
  -F "message=Analyze this document" \
  -F "website=gemini" \
  -F "files=@/path/to/document.pdf"
```

## Best Practices

### 1. Error Handling

Always check the `success` field in responses:

```javascript
async function safeRequest(endpoint, options) {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!data.success) {
      console.error('API Error:', data.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}
```

### 2. Session Management

The API manages sessions automatically. For multiple requests to the same website, the session persists:

```javascript
// First request authenticates and caches session
await client.sendMessage(chatId, 'First message', 'gemini');

// Second request reuses the same session
await client.sendMessage(chatId, 'Second message', 'gemini');
```

### 3. Multi-Website Usage

Work with multiple AI services in the same application:

```javascript
// Parallel operations on different websites
Promise.all([
  client.sendMessage(chatId1, 'Analyze data', 'deepseek'),
  client.generateImage('Visualization', 'gemini')
]);
```

### 4. Rate Limiting

Implement exponential backoff for retries:

```javascript
async function retryWithBackoff(fn, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

## Troubleshooting

### Issue: "Not authenticated with {website}"

**Solution:** Explicitly select the website before operations:
```javascript
await client.selectWebsite('gemini');
```

### Issue: "Chat not found"

**Solution:** Create a new chat or retrieve existing chats:
```javascript
const chats = await client.getChatList('deepseek');
if (chats.chats.length === 0) {
  const newChat = await client.createChat('deepseek');
  chatId = newChat.chat.id;
}
```

### Issue: Image generation fails for Qwen

**Solution:** Ensure proper download path permissions and check logs for download button detection issues.

### Issue: Timeout errors

**Solution:** Increase timeout for long operations like image generation:
```javascript
// External image generation can take several minutes
const imageResult = await Promise.race([
  client.generateImage(description, 'gemini'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 600000)
  )
]);
```

## API Response Status Codes

- **200** - Success
- **400** - Bad request (missing or invalid parameters)
- **401** - Authentication required or failed
- **404** - Resource not found
- **500** - Server error

## Support for Qwen Image Download

Qwen image generation now includes automatic download button triggering with:
- Multiple selector detection patterns
- Retry logic for robustness
- Support for Chinese button text
- Comprehensive logging for debugging

All image downloads are automatically processed and stored in the `/backend/downloaded_files/` directory with unique identifiers.
