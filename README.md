# Twitter Agent Backend - AI-Powered Social Media Intelligence Platform

A sophisticated backend system for Twitter automation, content intelligence, and social media analytics with real-time trend analysis and AI-powered content generation.

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

## Core Features

### 🤖 Twitter Agent Integration
- Real-time workflow notifications from local Twitter agents
- Tweet posting status tracking and analytics
- Engagement metrics collection and reporting
- Agent health monitoring and status updates

### 📊 Content Intelligence
- YouTube channel crawling and video analysis
- Multi-source trend aggregation and analysis
- AI-powered content generation based on trending topics
- Real-time keyword extraction and trend scoring

### 🚀 Social Media Automation
- Twitter posting and thread management
- Content formatting and optimization
- Automated hashtag placement
- Publishing workflow management

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Agent Integration (New)
- `POST /api/agent/workflows` - Receive workflow start notifications
- `POST /api/agent/workflows/:id/status` - Receive workflow status updates
- `POST /api/agent/tweets/posted` - Receive tweet posting notifications
- `POST /api/agent/engagement` - Receive engagement metrics
- `GET /api/agent/status` - Get agent integration status

### Twitter Automation
- `POST /v1/twitter/tweet` - Post individual tweets
- `POST /v1/twitter/thread` - Create Twitter threads
- `POST /v1/twitter/publish` - Publish project content to Twitter
- `GET /v1/twitter/status` - Twitter connection health

### Content Intelligence
- `GET /v1/sources` - List content sources (YouTube, RSS, etc.)
- `POST /v1/sources` - Add new content source
- `POST /v1/sources/crawl` - Trigger batch crawling
- `PUT /v1/sources/:id/status` - Update source status
- `DELETE /v1/sources/:id` - Remove source

### Analytics & Trends
- `GET /v1/analytics/topics` - Topic analytics with filtering
- `GET /v1/analytics/trends` - Real-time trend analysis
  - `?refresh=true` - Force trend regeneration
  - `?source_based=true` - Use only source-derived trends
- `POST /v1/analytics/refresh-trends` - Manually refresh trends
- `GET /v1/analytics/efficiency` - Performance metrics
- `GET /v1/stats/usage` - Usage statistics

### Project Management
- `GET /v1/projects` - List projects
- `POST /v1/projects` - Create project
- `PUT /v1/projects/:id` - Update project
- `DELETE /v1/projects/:id` - Delete project

### Content & Delivery
- `GET /v1/delivery/channels` - Available delivery channels
- `POST /v1/delivery/publish` - Publish content
- `GET /v1/user/profile` - User profile
- `PUT /v1/user/profile` - Update profile

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

### Twitter Agent Integration
- ✅ Real-time webhook support for local Twitter agents
- ✅ Workflow status tracking and notifications
- ✅ Tweet posting confirmation and analytics
- ✅ Engagement metrics collection

### Content Intelligence
- ✅ YouTube channel monitoring and video crawling
- ✅ Multi-source trend aggregation (YouTube, RSS, Twitter)
- ✅ AI-powered keyword extraction and analysis
- ✅ Real-time trend analysis with caching
- ✅ Content generation based on trending topics

### Social Media Automation
- ✅ Twitter posting with thread support
- ✅ Content formatting and optimization
- ✅ Automated hashtag placement
- ✅ Character limit validation

### System Features
- ✅ Full CRUD operations for sources and projects
- ✅ Advanced analytics with filtering and insights
- ✅ Input validation and comprehensive error handling
- ✅ CORS enabled for frontend integration
- ✅ In-memory data persistence with mock fallbacks
- ✅ Detailed request logging and monitoring
- ✅ Proper HTTP status codes and structured responses

## Architecture

### Backend Stack
- **Framework**: Express.js 4.x with RESTful API design
- **Data Storage**: In-memory JavaScript objects with mock fallbacks
- **External APIs**: YouTube RSS feeds, Twitter API integration
- **Caching**: TTL-based caching for trend data (10-minute refresh)
- **Validation**: Custom validation with comprehensive error handling
- **Logging**: Structured request/response logging
- **CORS**: Configured for frontend and agent integration

### Content Intelligence Pipeline
1. **Data Ingestion**: Crawls YouTube channels and RSS feeds
2. **Processing**: Extracts keywords and analyzes trends
3. **AI Generation**: Creates content based on trending topics
4. **Social Distribution**: Formats and posts to Twitter
5. **Analytics**: Tracks performance and provides insights

### Agent Integration
- **Webhook Support**: Real-time notifications from local agents
- **Status Tracking**: Comprehensive workflow monitoring
- **Metrics Collection**: Engagement and performance analytics
- **Health Monitoring**: Agent connectivity and status checks

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
