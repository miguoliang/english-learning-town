# API Reference

The English Learning Town backend provides a RESTful API for client-server communication. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
Development: http://localhost:3000
Production: https://api.english-learning-town.com
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Authentication Flow

1. **Login/Register**: Get initial JWT token
2. **Token Usage**: Include token in subsequent requests
3. **Token Refresh**: Renew tokens before expiration
4. **Logout**: Invalidate tokens on client side

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "name",
      "reason": "Name is required"
    }
  }
}
```

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Authenticated Users**: 1000 requests per hour
- **Anonymous Users**: 100 requests per hour
- **Question Endpoints**: 500 requests per hour per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## API Versioning

The API uses URL path versioning:

```
/v1/players/
/v1/questions/
/v1/interactions/
```

Current version: `v1`

## Health Check

### GET /health

Check server health and status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```
