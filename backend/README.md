# SaveIt.AI Backend

Complete dynamic backend for SaveIt.AI app - Save, retrieve, and manage links, notes, code snippets with AI-powered summaries.

## Tech Stack

- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Gemini API** - AI-powered summaries and metadata extraction
- **Axios** - HTTP client for web scraping
- **Cheerio** - HTML parsing and metadata extraction
- **Express Validator** - Input validation

## Features

- Save and manage multiple content types (links, notes, code, components)
- AI-powered metadata extraction for links using Gemini
- Automatic web scraping with Open Graph/Twitter Card support
- Smart summary generation and tag suggestions
- Advanced filtering, search, and pagination
- Full CRUD operations
- Statistics and analytics

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account (or local MongoDB)
- Gemini API key

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb+srv://saving-app:saving123@saving-app.2c3nmxz.mongodb.net/
GEMINI_API_KEY=AIzaSyCvZ-_U-NowyVAdCuLo1u3q3KCdoWnKTSI
```

4. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

---

#### 2. Save New Item
```http
POST /api/save
```

**Request Body:**
```json
{
  "type": "link",
  "content": "https://example.com/article",
  "title": "Optional custom title"
}
```

**Parameters:**
- `type` (required): One of `"link"`, `"note"`, `"code"`, `"component"`
- `content` (required): URL for links, or text content for other types
- `title` (optional): Custom title (auto-generated if not provided)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "type": "link",
    "content": "https://example.com/article",
    "title": "Article Title from Metadata",
    "description": "Article description...",
    "summary": "AI-generated summary of the article content...",
    "domain": "example.com",
    "thumbnail": "https://example.com/og-image.jpg",
    "image": "https://example.com/og-image.jpg",
    "favicon": "https://example.com/favicon.ico",
    "publishedDate": "2025-01-15T00:00:00.000Z",
    "author": "Author Name",
    "language": "en",
    "contentType": "article",
    "readabilityScore": 85,
    "tags": ["tag1", "tag2", "tag3"],
    "confidence": 0.95,
    "notes": null,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### 3. Get All Items (with filtering & pagination)
```http
GET /api/items?type=link&page=1&limit=20&search=javascript&tags=web,frontend
```

**Query Parameters:**
- `type` (optional): Filter by type (`link`, `note`, `code`, `component`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search in title, description, summary, content
- `tags` (optional): Comma-separated tags to filter by

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "type": "link",
      "title": "Article Title",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

#### 4. Get Single Item
```http
GET /api/item/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "type": "link",
    "title": "Article Title",
    ...
  }
}
```

---

#### 5. Update Item
```http
PUT /api/item/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new-tag1", "new-tag2"],
  "notes": "Additional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Updated Title",
    ...
  }
}
```

---

#### 6. Delete Item
```http
DELETE /api/item/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

#### 7. Get Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 45,
    "itemsByType": [
      { "_id": "link", "count": 30 },
      { "_id": "note", "count": 10 },
      { "_id": "code", "count": 5 }
    ],
    "topTags": [
      { "_id": "javascript", "count": 15 },
      { "_id": "web-development", "count": 12 },
      { "_id": "tutorial", "count": 8 }
    ]
  }
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

### Item Model
```javascript
{
  type: String,              // 'link', 'note', 'code', 'component'
  content: String,           // URL or text content
  title: String,             // Max 200 chars
  description: String,       // Max 1000 chars
  summary: String,           // Max 600 chars
  domain: String,            // For links
  thumbnail: String,         // Image URL
  favicon: String,           // Favicon URL
  image: String,             // Main image URL
  publishedDate: Date,       // Publication date
  author: String,            // Author name
  language: String,          // ISO language code
  contentType: String,       // 'article', 'product', etc.
  readabilityScore: Number,  // 0-100
  tags: [String],            // Array of tags
  confidence: Number,        // 0.0-1.0 AI confidence
  notes: String,             // Max 200 chars
  createdAt: Date,
  updatedAt: Date
}
```

## AI-Powered Features

### LinkSaver Pattern (Gemini)

The backend uses an advanced AI prompt pattern for link metadata extraction:

1. **Scrapes webpage** using Axios + Cheerio
2. **Extracts metadata** from Open Graph, Twitter Cards, and HTML tags
3. **Sends to Gemini AI** with structured prompt
4. **Returns enhanced JSON** with:
   - Intelligent summary (1-3 sentences)
   - Auto-generated tags (3-6 tags)
   - Confidence score
   - Content classification
   - Language detection
   - Readability score

### For Non-Link Content

- Generates concise summaries
- Suggests relevant tags
- Adapts to content type (note, code, component)

## Testing with Postman

### 1. Save a Link
```
POST http://localhost:5000/api/save
Content-Type: application/json

{
  "type": "link",
  "content": "https://github.com"
}
```

### 2. Get All Items
```
GET http://localhost:5000/api/items
```

### 3. Search Items
```
GET http://localhost:5000/api/items?search=github&type=link
```

### 4. Delete an Item
```
DELETE http://localhost:5000/api/item/{item_id}
```

## Folder Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   └── Item.js            # Mongoose schema
├── routes/
│   └── itemRoutes.js      # API endpoints
├── utils/
│   └── gemini.js          # AI utilities
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── server.js             # Express server
└── README.md             # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `FRONTEND_URL` to production domain
3. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name saveit-backend
pm2 save
pm2 startup
```

## Git Commands (Initial Setup)

```bash
cd backend
git init
git add .
git commit -m "Initial backend setup with Gemini + MongoDB"
git branch -M main
git remote add origin https://github.com/abdulhaseebmughal/saving-app.git
git push -u origin main
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with by SaveIt.AI Team
