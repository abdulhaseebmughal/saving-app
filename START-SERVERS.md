# Quick Start Guide for SaveIt.AI

## 🚀 Starting Both Servers

### Option 1: Two Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Wait until you see: "MongoDB Connected"

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Wait until you see: "Ready in..."

### Option 2: One Terminal with Background Process

**Windows (PowerShell):**
```powershell
# Start backend in background
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory ".\backend"

# Start frontend
npm run dev
```

**Windows (CMD):**
```cmd
cd backend && start /B npm start && cd .. && npm run dev
```

## ✅ Verify Servers Are Running

Open these URLs in your browser:

1. **Frontend:** http://localhost:3000
2. **Backend Health:** http://localhost:5000/health
3. **Backend API:** http://localhost:5000/api/items

You should see:
- Frontend: SaveIt.AI dashboard
- Health: `{"status":"ok",...}`
- API: `{"success":true,"data":[...]}`

## 🛑 Stopping Servers

**Method 1:** Press `Ctrl+C` in each terminal

**Method 2:** Kill processes by port
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### MongoDB Connection Error
- Check internet connection
- Verify MONGO_URI in `backend/.env`
- MongoDB Atlas cluster should be running

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check `app/api/*/route.ts` files have correct BACKEND_URL
- Default: `http://localhost:5000`

## 📊 Quick Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Save an item
curl -X POST http://localhost:5000/api/save \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"link\",\"content\":\"https://github.com\"}"

# Get all items
curl http://localhost:5000/api/items
```

### Test Frontend
1. Open http://localhost:3000
2. Enter a URL: `https://github.com`
3. Click "Save Link"
4. See AI-generated summary and tags

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb+srv://saving-app:saving123@saving-app.2c3nmxz.mongodb.net/
GEMINI_API_KEY=AIzaSyCvZ-_U-NowyVAdCuLo1u3q3KCdoWnKTSI
```

### Frontend (optional .env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:5000
```

## 🎯 What's Next?

Once both servers are running:
1. Visit http://localhost:3000
2. Start saving links, notes, and code
3. All data is stored in MongoDB
4. AI automatically generates summaries and tags

For API documentation, see: [backend/README.md](backend/README.md)

---

**Need Help?** Check the full documentation in [NEXT-STEPS.md](NEXT-STEPS.md)
