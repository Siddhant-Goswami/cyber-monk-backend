# Content Management Dashboard API - Simplified MVP Implementation Plan

## Overview
Simplified MVP implementation plan for a Content Management Dashboard API focusing on core functionality with minimal setup complexity.

## Architecture Decision - Simplified MVP

### Tech Stack Selection
- **Framework**: Express.js (simple, fast setup)
- **Database**: In-memory data structures (arrays, objects)
- **Authentication**: None (skip for MVP)
- **Testing**: Basic manual testing initially
- **Documentation**: Simple README with endpoint examples

### Why This Simplified Stack?
1. **Express.js**: Minimal setup, fast development, widely understood
2. **In-memory storage**: No database setup required, easy to iterate
3. **No auth**: Focus on core API functionality first
4. **Simple testing**: Get MVP working quickly before adding complexity

## Project Structure - Simplified

```
src/
├── routes/
│   ├── sources.js         # Sources management endpoints
│   ├── projects.js        # Projects management endpoints
│   ├── analytics.js       # Analytics endpoints
│   ├── topics.js          # Topics endpoints
│   └── delivery.js        # Delivery endpoints
├── data/
│   ├── sources.js         # In-memory sources data
│   ├── projects.js        # In-memory projects data
│   ├── topics.js          # In-memory topics data
│   └── analytics.js       # Mock analytics data
├── utils/
│   └── helpers.js         # Utility functions
└── app.js                 # Express app setup
```

## Implementation Tasks Breakdown - MVP Only

### Phase 1: Basic Express Setup (1-2 hours)
1. **Project Initialization**
   - Initialize Node.js project with npm
   - Install Express.js and basic dependencies
   - Set up basic project structure
   - Create package.json with start script

2. **Core Infrastructure**
   - Express app setup with middleware
   - Basic error handling
   - CORS configuration
   - JSON parsing middleware

### Phase 2: In-Memory Data & Core Endpoints (2-3 hours)
3. **Data Layer Setup**
   - Create in-memory data structures for sources, projects, topics
   - Mock analytics data with realistic sample data
   - Helper functions for data manipulation (find, create, update, delete)

4. **Sources Management**
   - GET /sources (list all sources)
   - POST /sources (add new source)
   - PUT /sources/:id/status (update status)
   - DELETE /sources/:id (remove source)

5. **Projects Management**
   - GET /projects (list all projects)
   - POST /projects (create project)
   - PUT /projects/:id (update project)
   - DELETE /projects/:id (delete project)

6. **Analytics Endpoints**
   - GET /stats/usage (usage statistics)
   - GET /analytics/topics (topic performance)
   - GET /analytics/trends (trend data)
   - GET /analytics/efficiency (efficiency metrics)

### Phase 3: Additional Endpoints (1-2 hours)
7. **Topics Management**
   - GET /analytics/topics with filtering
   - Basic topic data structure
   - Status management

8. **Delivery Management**
   - GET /delivery/channels (list channels)
   - POST /delivery/publish (mock publish)

9. **User Profile (Simplified)**
   - GET /user/profile (static mock data)

## In-Memory Data Structures

### Core Data Models

```javascript
// In-memory storage
let sources = [
  {
    id: 1,
    name: "Tech Channel",
    type: "YouTube",
    url: "https://youtube.com/@techchannel",
    status: "active",
    lastCrawled: "2024-01-15T10:30:00Z",
    icon: "youtube"
  }
];

let projects = [
  {
    id: 1,
    title: "Tech Review Series",
    description: "Weekly technology product reviews",
    status: "active",
    totalViews: 125000,
    engagement: 8.5,
    lastUpdated: "2024-01-15T14:30:00Z",
    thumbnail: "/api/projects/1/thumbnail"
  }
];

let topics = [
  {
    id: 1,
    title: "AI-Powered Code Reviews",
    status: "accepted",
    views: 45200,
    engagement: 8.7,
    uplift: "+32%",
    suggestedDate: "2024-01-10T00:00:00Z",
    publishedDate: "2024-01-12T00:00:00Z"
  }
];

let deliveryChannels = [
  {
    id: 1,
    name: "YouTube",
    type: "video",
    status: "connected",
    lastSync: "2024-01-15T12:00:00Z"
  }
];

// Analytics mock data
let usageStats = {
  topicsAccepted: { value: 18, change: "+2 from last month" },
  avgViewsUplift: { value: "+28%", change: "vs your baseline" },
  researchTimeSaved: { value: "4.2h", change: "per accepted topic" },
  totalViews: { value: "1.2M", change: "from suggested topics" }
};
```

## API Endpoints Implementation Priority - MVP Only

### Essential Endpoints (Must Have)
1. `GET /sources` - List sources
2. `POST /sources` - Add source
3. `PUT /sources/:id/status` - Toggle source status
4. `DELETE /sources/:id` - Remove source
5. `GET /projects` - List projects
6. `POST /projects` - Create project
7. `PUT /projects/:id` - Update project
8. `DELETE /projects/:id` - Delete project
9. `GET /stats/usage` - Basic usage stats

### Nice to Have (If Time Permits)
10. `GET /analytics/topics` - Topic analytics
11. `GET /analytics/trends` - Trend analysis
12. `GET /analytics/efficiency` - Efficiency metrics
13. `GET /delivery/channels` - Delivery channels
14. `POST /delivery/publish` - Mock publish
15. `GET /user/profile` - Static user profile

## MVP Requirements

### Basic Setup
- Express.js server with CORS
- JSON request/response handling
- Basic error handling
- In-memory data persistence

### Essential Features
1. **Sources Management**: Full CRUD operations
2. **Projects Management**: Full CRUD operations  
3. **Analytics**: Mock data for dashboard
4. **Error Handling**: Proper HTTP status codes
5. **Data Validation**: Basic input validation

## Development Approach

### Time Estimate: 4-6 hours total
- **Setup**: 1 hour (Express app, folder structure)
- **Sources API**: 1.5 hours (CRUD endpoints)  
- **Projects API**: 1.5 hours (CRUD endpoints)
- **Analytics API**: 1 hour (mock data endpoints)
- **Testing & Polish**: 1 hour (manual testing, error handling)

### Success Criteria - MVP
1. All 9 essential endpoints working
2. Realistic mock data responses
3. Proper error handling (400, 404, 500)
4. CORS configured for frontend access
5. Server can be started with `npm start`

### Testing Strategy - MVP
- Manual testing with curl/Postman
- Test all CRUD operations
- Verify error responses
- Check data persistence during server run

## Next Steps

1. **Review and approval** of this simplified implementation plan
2. **Project initialization** - Create package.json and install Express.js
3. **Folder structure** - Set up routes, data, and utils folders
4. **Core endpoints** - Implement essential CRUD operations
5. **Testing** - Manual testing of all endpoints

This simplified plan focuses on getting a working MVP quickly with minimal setup complexity. The in-memory approach allows for rapid iteration and testing before moving to a real database later.