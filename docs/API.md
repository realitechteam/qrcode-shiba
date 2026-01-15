# 🔌 API Documentation

## QRCode-Shiba REST API

**Base URLs**:
- Auth Service: `http://localhost:3001/api/v1`
- QR Service: `http://localhost:3002/api/v1`
- Redirect Service: `http://localhost:3003`
- Payment Service: `http://localhost:3004/api/v1`

---

## 🔐 Authentication

### Headers
```http
Authorization: Bearer <access_token>
x-user-id: <user_id>  # For QR/Folder services
```

---

## 📋 Auth Service Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Nguyen Van A"
}
```

**Response** `201 Created`:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nguyen Van A"
  },
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt..."
}
```

### Google OAuth
```http
GET /auth/google
# Redirects to Google login
```

---

## 📁 Folder Endpoints

### Create Folder
```http
POST /folders
x-user-id: <user_id>
Content-Type: application/json

{
  "name": "Marketing",
  "color": "#FF5733",
  "parentId": null
}
```

**Response** `201 Created`:
```json
{
  "id": "uuid",
  "name": "Marketing",
  "color": "#FF5733",
  "parentId": null,
  "userId": "uuid",
  "_count": { "qrCodes": 0 }
}
```

### Get Folder Tree
```http
GET /folders
x-user-id: <user_id>
```

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Marketing",
    "color": "#FF5733",
    "qrCount": 5,
    "children": [
      {
        "id": "uuid",
        "name": "Campaigns",
        "qrCount": 3,
        "children": []
      }
    ]
  }
]
```

### Update Folder
```http
PATCH /folders/:id
x-user-id: <user_id>
Content-Type: application/json

{
  "name": "New Name",
  "color": "#3B82F6"
}
```

### Delete Folder
```http
DELETE /folders/:id
x-user-id: <user_id>
```

**Response** `204 No Content`

### Move QR to Folder
```http
PATCH /folders/:folderId/qr/:qrId
x-user-id: <user_id>
```

---

## 📱 QR Code Endpoints

### Generate Preview
```http
POST /qr/preview
Content-Type: application/json

{
  "type": "URL",
  "data": { "url": "https://example.com" },
  "styling": {
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "cornerStyle": "rounded"
  },
  "size": 300
}
```

**Response**:
```json
{
  "dataUrl": "data:image/png;base64,...",
  "svg": "<svg>...</svg>",
  "size": 300
}
```

### Create QR Code
```http
POST /qr
x-user-id: <user_id>
Content-Type: application/json

{
  "type": "URL",
  "name": "My Website",
  "data": { "url": "https://example.com" },
  "styling": { ... },
  "isDynamic": true,
  "folderId": "uuid"
}
```

### List QR Codes
```http
GET /qr?page=1&limit=20&folder=uuid&search=keyword
x-user-id: <user_id>
```

**Response**:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Get QR Code
```http
GET /qr/:id
x-user-id: <user_id>
```

### Update QR Code
```http
PATCH /qr/:id
x-user-id: <user_id>
Content-Type: application/json

{
  "name": "Updated Name",
  "destinationUrl": "https://newurl.com"
}
```

### Delete QR Code
```http
DELETE /qr/:id
x-user-id: <user_id>
```

### Download QR
```http
GET /qr/:id/download?format=png&size=1024
x-user-id: <user_id>
```

**Response**: Binary file (PNG/SVG/PDF)

### Get QR Stats
```http
GET /qr/:id/stats?period=30d
x-user-id: <user_id>
```

**Response**:
```json
{
  "total": 1500,
  "period": "30d",
  "byDate": [
    { "date": "2026-01-15", "count": 50 }
  ],
  "byCountry": [
    { "name": "Vietnam", "count": 1200 }
  ],
  "byDevice": [
    { "name": "Mobile", "count": 900 }
  ]
}
```

---

## 🔗 Redirect Service

### QR Redirect
```http
GET /:shortCode
```

**Response** `302 Redirect` to destination URL

---

## 💳 Payment Endpoints

### Create VNPay Payment
```http
POST /vnpay/create-payment
x-user-id: <user_id>
Content-Type: application/json

{
  "planId": "pro",
  "billingCycle": "monthly"
}
```

### Create MoMo Payment
```http
POST /momo/create-payment
x-user-id: <user_id>
Content-Type: application/json

{
  "planId": "pro",
  "billingCycle": "monthly"
}
```

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limited |
| 500 | Server Error |

---

## 📊 Rate Limits

| Tier | Requests/min |
|------|--------------|
| Free | 60 |
| Pro | 300 |
| Business | 1000 |
| Enterprise | Custom |

---

*API documentation maintained by Tech Team*
