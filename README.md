# Content Management Dashboard API

A simplified MVP implementation of a Content Management Dashboard API with in-memory data storage.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start with auto-reload for development
npm run dev
```

The API will be available at `http://localhost:3001/v1`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Sources Management
- `GET /v1/sources` - List all sources
- `POST /v1/sources` - Create new source
- `PUT /v1/sources/:id/status` - Update source status
- `DELETE /v1/sources/:id` - Delete source

### Projects Management
- `GET /v1/projects` - List all projects
- `POST /v1/projects` - Create new project
- `PUT /v1/projects/:id` - Update project
- `DELETE /v1/projects/:id` - Delete project

### Analytics & Statistics
- `GET /v1/stats/usage` - Usage statistics
- `GET /v1/analytics/topics` - Topic analytics (supports ?status= filter)
- `GET /v1/analytics/trends` - Trend data (cached)
  - Optional: `?refresh=true` to force regeneration on-demand
  - Optional: `?source_based=true` to use only source-derived trends
- `GET /v1/analytics/efficiency` - Efficiency metrics
- `POST /v1/analytics/refresh-trends` - Explicitly refresh trending topics now
  - Optional: `?source_based=true` to use only source-derived trends

Both trends endpoints return the same shape:

```
{
  "trends": [
    { "keyword": string, "growth": string, "category": string, "mentions": number }
  ],
  "trends_count": number,
  "analysis_summary": {
    "sources_analyzed": number,
    "total_keywords_extracted": number,
    "last_updated": string, // ISO timestamp
    "real_data_sources": number // when applicable
  }
}
```

### Delivery Management
- `GET /v1/delivery/channels` - List delivery channels
- `POST /v1/delivery/publish` - Publish content (mock)

### User Management
- `GET /v1/user/profile` - Get user profile
- `PUT /v1/user/profile` - Update user profile

## Example Usage

### Create a new source
```bash
curl -X POST http://localhost:3001/v1/sources \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/feed", "type": "RSS"}'
```

### Get usage statistics
```bash
curl -X GET http://localhost:3001/v1/stats/usage
```

### Filter topics by status
```bash
curl -X GET "http://localhost:3001/v1/analytics/topics?status=accepted"
```

## Features

- ✅ Full CRUD operations for sources and projects
- ✅ Mock analytics data with realistic examples
- ✅ Input validation and error handling
- ✅ CORS enabled for frontend access
- ✅ In-memory data persistence (during server runtime)
- ✅ Request logging
- ✅ Proper HTTP status codes

## Architecture

- **Framework**: Express.js 4.x
- **Data Storage**: In-memory JavaScript objects/arrays
- **Validation**: Custom validation functions
- **Error Handling**: Centralized error responses
- **CORS**: Enabled for common frontend ports

## Project Structure

```
src/
├── routes/          # API endpoint handlers
├── data/            # In-memory data stores
├── utils/           # Helper functions
└── app.js           # Express app configuration
```

## Development Notes

This is an MVP implementation using in-memory storage. Data will reset when the server restarts. For production use, integrate with a real database (PostgreSQL, MongoDB, etc.).

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

Error codes include: `INVALID_REQUEST`, `NOT_FOUND`, `INTERNAL_ERROR`
