# Twitter Agent Backend API

A comprehensive Twitter Agent backend with content management, analytics, and automated Twitter publishing capabilities. Features include content sourcing, trend analysis, and intelligent Twitter thread generation.

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

### Twitter Integration
- `GET /v1/twitter/status` - Check Twitter connection status
- `POST /v1/twitter/debug` - Debug endpoint for testing
- `POST /v1/twitter/post` - Post a single tweet
- `POST /v1/twitter/tweet` - Post a single tweet (alias)
- `POST /v1/twitter/thread` - Post a Twitter thread with automatic numbering
- `POST /v1/twitter/publish` - Publish project content to Twitter (single tweet or thread)

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

### Post a Twitter thread
```bash
curl -X POST http://localhost:3001/v1/twitter/thread \
  -H "Content-Type: application/json" \
  -d '{
    "tweets": [
      "First tweet in the thread about exciting news!",
      "Second tweet with more details and context.",
      "Final tweet wrapping up the discussion."
    ],
    "hashtags": ["AI", "Twitter", "TechNews"]
  }'
```

### Publish project content to Twitter
```bash
curl -X POST http://localhost:3001/v1/twitter/publish \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "content": "Check out our latest project update!",
    "type": "tweet",
    "hashtags": ["project", "update"]
  }'
```

## Features

- ✅ Full CRUD operations for sources and projects
- ✅ Twitter integration with thread posting capabilities
- ✅ Automated content publishing to Twitter
- ✅ Intelligent thread formatting with numbering
- ✅ Hashtag management and optimization
- ✅ Content management and analytics
- ✅ Trend analysis and monitoring
- ✅ Mock analytics data with realistic examples
- ✅ Input validation and error handling
- ✅ CORS enabled for frontend access
- ✅ In-memory data persistence (during server runtime)
- ✅ Request logging
- ✅ Proper HTTP status codes

## Architecture

- **Framework**: Express.js 4.x
- **Twitter Integration**: Custom Twitter service with thread support
- **Content Management**: Automated content sourcing and processing
- **Analytics Engine**: Trend analysis and performance tracking
- **Data Storage**: In-memory JavaScript objects/arrays
- **Validation**: Custom validation functions
- **Error Handling**: Centralized error responses
- **CORS**: Enabled for common frontend ports

## Project Structure

```
src/
├── routes/          # API endpoint handlers
│   ├── twitter.js   # Twitter integration endpoints
│   ├── analytics.js # Analytics and trends
│   └── ...         # Other route modules
├── services/        # Business logic services
│   ├── twitter.js   # Twitter posting service
│   ├── trends-service.js # Trend analysis
│   └── content.js   # Content management
├── data/            # In-memory data stores
├── utils/           # Helper functions
└── app.js           # Express app configuration
```

## Development Notes

This Twitter Agent backend is an MVP implementation using in-memory storage. Data will reset when the server restarts. 

### Key Features:
- **Twitter Thread Support**: Automatically formats and numbers threads
- **Content Publishing**: Intelligent content distribution to Twitter
- **Analytics Dashboard**: Real-time trend analysis and metrics
- **Content Sourcing**: Automated content discovery and processing

### Production Considerations:
- Integrate with a real database (PostgreSQL, MongoDB, etc.)
- Add Twitter API authentication and rate limiting
- Implement content scheduling and automation
- Add user authentication and authorization
- Scale analytics processing for larger datasets

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
