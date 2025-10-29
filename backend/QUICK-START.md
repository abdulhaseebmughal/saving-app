# SaveIt.AI Backend - Quick Start Guide

## Before Starting

**IMPORTANT:** There's currently a process running on port 5000. You need to stop it first or change the port in `.env`

### Option 1: Kill existing process
```bash
# Find the process (already running on PID 9540)
taskkill /PID 9540 /F

# Or use a different port in .env
PORT=5001
```

## Start the Server

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║     SaveIt.AI Backend Server         ║
╠═══════════════════════════════════════╣
║  Server running on port 5000         ║
║  Environment: development            ║
║  API Base: http://localhost:5000/api ║
╚═══════════════════════════════════════╝

MongoDB Connected: saving-app.2c3nmxz.mongodb.net
```

## Test the API

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Save a Link
```bash
curl -X POST http://localhost:5000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "type": "link",
    "content": "https://github.com"
  }'
```

### 3. Get All Items
```bash
curl http://localhost:5000/api/items
```

### 4. Get Statistics
```bash
curl http://localhost:5000/api/stats
```

## Testing with Postman

1. Open Postman
2. Import `postman_collection.json`
3. Run the requests in order:
   - Health Check
   - Save Link
   - Get All Items
   - Update Item (use ID from save response)
   - Delete Item

## Common Issues

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Kill the existing process or change PORT in `.env`

### MongoDB Connection Failed
```
Error connecting to MongoDB
```

**Solution:** Check your `MONGO_URI` in `.env` file

### Gemini API Error
```
Gemini API Error: 400
```

**Solution:** Verify `GEMINI_API_KEY` in `.env` file

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/save` | Save new item |
| GET | `/api/items` | Get all items (with filters) |
| GET | `/api/item/:id` | Get single item |
| PUT | `/api/item/:id` | Update item |
| DELETE | `/api/item/:id` | Delete item |
| GET | `/api/stats` | Get statistics |

## Next Steps

1. Stop the existing process on port 5000
2. Start the backend server
3. Test with Postman using the collection
4. Connect your Next.js frontend
5. Build awesome features!

## Need Help?

Check [README.md](README.md) for complete documentation.
