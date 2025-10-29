# Quick Server Restart Guide

## The delete error is happening because the frontend is still using old code.

### Manual Restart (Use This):

**Step 1: Stop All Servers**
```bash
# Press Ctrl+C in the terminal running the servers
# OR kill the processes manually
```

**Step 2: Kill Port 5000 (Backend)**
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it (replace PID with the actual number)
taskkill /F /PID <PID>
```

**Step 3: Kill Port 3000 (Frontend)**
```bash
# Find the process
netstat -ano | findstr :3000

# Kill it (replace PID with the actual number)
taskkill /F /PID <PID>
```

**Step 4: Start Backend**
```bash
cd backend
npm start
```

Wait for: "MongoDB Connected"

**Step 5: Start Frontend (New Terminal)**
```bash
npm run dev
```

Wait for: "Ready in X.Xs"

**Step 6: Test**
- Open: http://localhost:3000
- Save an item
- Try to delete it
- Should work now!

## Why the Error Happened

The Next.js frontend dev server cached the old API route code. The fix I made to [app/api/item/[id]/route.ts](app/api/item/[id]/route.ts) requires a fresh server restart.

## What Was Fixed

**Before:**
```typescript
{ params }: { params: { id: string } }
const response = await fetch(`${BACKEND_URL}/api/item/${params.id}`)
// params.id was undefined because params wasn't awaited
```

**After:**
```typescript
{ params }: { params: Promise<{ id: string }> }
const { id } = await params
const response = await fetch(`${BACKEND_URL}/api/item/${id}`)
// Now properly awaits params before using id
```

## Quick Test After Restart

1. Open http://localhost:3000
2. Click on any saved item's delete button (trash icon)
3. Should see "Deleted" toast notification
4. Item should disappear from the list
5. No errors in console!

---

**If you still get errors after restarting, run this in terminal:**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall (if needed)
npm install --legacy-peer-deps

# Start fresh
npm run dev
```
