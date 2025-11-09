# HotelEase API Testing Guide

## 🌐 Server Information
- **Base URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

## 📋 Available Endpoints

### 1. Health Check
```
GET /api/health
```
**Test in browser**: Just open `http://localhost:5000/api/health`

---

### 2. Hotels (CRUD Operations)

#### Get All Hotels (with pagination & filters)
```
GET /api/hotels?page=1&limit=10&location=New%20York&minPrice=50&maxPrice=500&minRating=4
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `q` - Search query (searches name and description)
- `location` - Filter by location
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `minRating` - Minimum rating

**Example using curl:**
```bash
curl http://localhost:5000/api/hotels
curl "http://localhost:5000/api/hotels?page=1&limit=5&location=Paris"
```

**Example using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels?page=1&limit=5"
```

---

#### Get Single Hotel
```
GET /api/hotels/:id
```

**Example:**
```bash
curl http://localhost:5000/api/hotels/1
```

---

#### Create Hotel (Admin)
```
POST /api/hotels
Content-Type: application/json

{
  "name": "Grand Hotel",
  "location": "New York",
  "address": "123 Main St, New York, NY 10001",
  "description": "A luxurious hotel in the heart of the city",
  "price_per_night": 150.00,
  "rating": 4.5,
  "images": ["https://example.com/image1.jpg"],
  "amenities": ["WiFi", "Pool", "Spa"],
  "policies": ["Check-in: 3 PM", "Check-out: 11 AM"]
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -d '{"name":"Grand Hotel","location":"New York","price_per_night":150}'
```

**Example using PowerShell:**
```powershell
$body = @{
  name = "Grand Hotel"
  location = "New York"
  price_per_night = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/hotels" -Method POST -Body $body -ContentType "application/json"
```

---

#### Update Hotel (Admin)
```
PUT /api/hotels/:id
Content-Type: application/json

{
  "name": "Updated Hotel Name",
  "price_per_night": 200.00
}
```

**Example:**
```bash
curl -X PUT http://localhost:5000/api/hotels/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","price_per_night":200}'
```

---

#### Delete Hotel (Admin)
```
DELETE /api/hotels/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/hotels/1
```

---

## 🧪 Testing Tools

### Option 1: Browser (GET requests only)
- Open: `http://localhost:5000/api/health`
- Open: `http://localhost:5000/api/hotels`

### Option 2: PowerShell (Windows)
```powershell
# GET request
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"

# POST request
$body = @{
  name = "Test Hotel"
  location = "Test City"
  price_per_night = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/hotels" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Option 3: Postman
1. Download Postman: https://www.postman.com/downloads/
2. Create a new request
3. Set method (GET, POST, PUT, DELETE)
4. Enter URL: `http://localhost:5000/api/hotels`
5. For POST/PUT: Go to Body tab → raw → JSON
6. Click Send

### Option 4: VS Code REST Client Extension
1. Install "REST Client" extension
2. Create a `.http` file
3. Write requests like:
```http
GET http://localhost:5000/api/hotels

###
POST http://localhost:5000/api/hotels
Content-Type: application/json

{
  "name": "Test Hotel",
  "location": "Test City",
  "price_per_night": 100
}
```

---

## 🔍 Quick Test Commands

**Check if server is running:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

**Get all hotels:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"
```

**Get hotels with filters:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/hotels?page=1&limit=5&minPrice=50&maxPrice=200"
```

---

## ⚠️ Important Notes

1. **Start the server first:**
   ```bash
   cd backend/newbackend
   npm start
   # or
   npm run dev
   ```

2. **Database must be connected** - Check server logs for connection status

3. **Currently implemented endpoints:**
   - ✅ GET /api/health
   - ✅ GET /api/hotels (with filters)
   - ✅ GET /api/hotels/:id
   - ✅ POST /api/hotels
   - ✅ PUT /api/hotels/:id
   - ✅ DELETE /api/hotels/:id

4. **Other endpoints are placeholders** and will return "to be implemented" messages

