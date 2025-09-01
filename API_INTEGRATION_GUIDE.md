# Content Management Dashboard API - Frontend Integration Guide

## Overview

This document provides comprehensive integration guidelines for frontend applications connecting to the Content Management Dashboard API. The API is a RESTful service built with Express.js and provides endpoints for managing content sources, projects, analytics, and user profiles.

**Base URL**: `http://localhost:3001`  
**API Version**: `v1`  
**Content-Type**: `application/json`

## Quick Start

### 1. Health Check
Before integrating, verify the API is running:

```javascript
const response = await fetch('http://localhost:3001/health');
const health = await response.json();
console.log(health);
// { status: 'OK', timestamp: '2024-01-16T10:00:00.000Z', uptime: 123.45 }
```

### 2. CORS Configuration
The API is configured to accept requests from common frontend development ports:
- `http://localhost:3000` (Create React App)
- `http://localhost:3001` (Alternative port)
- `http://localhost:5173` (Vite)

## API Endpoints

### Sources Management

#### Get All Sources
```
GET /v1/sources
```

**Response:**
```json
{
  "sources": [
    {
      "id": 1,
      "name": "Tech Channel",
      "type": "YouTube",
      "url": "https://youtube.com/@techchannel",
      "status": "active",
      "lastCrawled": "2024-01-15T10:30:00Z",
      "icon": "youtube"
    }
  ]
}
```

**Frontend Integration Example:**
```javascript
const fetchSources = async () => {
  try {
    const response = await fetch('http://localhost:3001/v1/sources');
    const data = await response.json();
    return data.sources;
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    throw error;
  }
};
```

#### Create New Source
```
POST /v1/sources
```

**Request Body:**
```json
{
  "url": "https://example.com/feed",
  "type": "RSS",
  "name": "Example Blog"
}
```

**Required Fields:**
- `url` (string): Valid URL format
- `type` (string): One of "YouTube", "RSS", "Twitter", "Blog"

**Optional Fields:**
- `name` (string): Display name for the source

**Response (201):**
```json
{
  "id": 4,
  "name": "Example Blog",
  "type": "RSS",
  "url": "https://example.com/feed",
  "status": "active",
  "lastCrawled": null,
  "icon": "rss"
}
```

**Frontend Integration Example:**
```javascript
const createSource = async (sourceData) => {
  try {
    const response = await fetch('http://localhost:3001/v1/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sourceData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create source:', error);
    throw error;
  }
};

// Usage
const newSource = await createSource({
  url: "https://techcrunch.com/feed",
  type: "RSS",
  name: "TechCrunch"
});
```

#### Update Source Status
```
PUT /v1/sources/:id/status
```

**Request Body:**
```json
{
  "status": "paused"
}
```

**Valid Status Values:**
- `active`: Source is actively being monitored
- `paused`: Source monitoring is temporarily disabled
- `error`: Source has encountered an error

**Response (200):**
```json
{
  "id": 1,
  "name": "Tech Channel",
  "type": "YouTube",
  "url": "https://youtube.com/@techchannel",
  "status": "paused",
  "lastCrawled": "2024-01-15T10:30:00Z",
  "icon": "youtube"
}
```

**Frontend Integration Example:**
```javascript
const updateSourceStatus = async (sourceId, status) => {
  try {
    const response = await fetch(`http://localhost:3001/v1/sources/${sourceId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update source status:', error);
    throw error;
  }
};
```

#### Delete Source
```
DELETE /v1/sources/:id
```

**Response:** `204 No Content`

**Frontend Integration Example:**
```javascript
const deleteSource = async (sourceId) => {
  try {
    const response = await fetch(`http://localhost:3001/v1/sources/${sourceId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete source:', error);
    throw error;
  }
};
```

### Projects Management

#### Get All Projects
```
GET /v1/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Tech Review Series",
      "description": "Weekly technology product reviews",
      "status": "active",
      "totalViews": 125000,
      "engagement": 8.5,
      "lastUpdated": "2024-01-15T14:30:00Z",
      "thumbnail": "/api/projects/1/thumbnail"
    }
  ]
}
```

#### Create New Project
```
POST /v1/projects
```

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "category": "Technology"
}
```

**Required Fields:**
- `title` (string): Project title

**Optional Fields:**
- `description` (string): Project description
- `category` (string): Project category

**Frontend Integration Example:**
```javascript
const createProject = async (projectData) => {
  try {
    const response = await fetch('http://localhost:3001/v1/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
};
```

#### Update Project
```
PUT /v1/projects/:id
```

**Request Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "draft"
}
```

**Note:** Fields `id`, `totalViews`, and `engagement` are read-only and will be ignored in updates.

#### Delete Project
```
DELETE /v1/projects/:id
```

**Response:** `204 No Content`

### Analytics

#### Get Topic Analytics
```
GET /v1/analytics/topics?status=accepted&timeRange=7d
```

**Query Parameters:**
- `status` (optional): Filter by topic status
- `timeRange` (optional): Time range filter

**Response:**
```json
{
  "topics": [
    {
      "id": 1,
      "title": "AI-Powered Code Reviews",
      "status": "accepted",
      "views": 45200,
      "engagement": 8.7,
      "uplift": "+32%",
      "suggestedDate": "2024-01-10T00:00:00Z",
      "publishedDate": "2024-01-12T00:00:00Z"
    }
  ]
}
```

#### Get Trends Data
```
GET /v1/analytics/trends?refresh=true&source_based=true
```

**Query Parameters:**
- `refresh` (optional): `true` to force regeneration; otherwise returns cached data and triggers background refresh if stale.
- `source_based` (optional): `true` to ensure trends are derived from real/source crawling (no fabricated mock additions).

**Response:**
```json
{
  "trends": [
    { "keyword": "ai", "growth": "+120%", "category": "Technology", "mentions": 8 }
  ],
  "trends_count": 12,
  "analysis_summary": {
    "sources_analyzed": 2,
    "total_keywords_extracted": 12,
    "last_updated": "2024-08-28T12:34:56.000Z",
    "real_data_sources": 1
  }
}
```

#### Get Efficiency Metrics
```
GET /v1/analytics/efficiency
```

**Response:**
```json
{
  "contentCreationTime": {
    "average": "2.5h",
    "improvement": "-30%"
  },
  "researchEfficiency": {
    "topicsPerHour": 4.2,
    "accuracy": "89%"
  }
}
```

### Statistics

#### Get Usage Statistics
```
GET /v1/stats/usage
```

**Response:**
```json
{
  "topicsAccepted": {
    "value": 18,
    "change": "+2 from last month"
  },
  "avgViewsUplift": {
    "value": "+28%",
    "change": "vs your baseline"
  },
  "researchTimeSaved": {
    "value": "4.2h",
    "change": "per accepted topic"
  },
  "totalViews": {
    "value": "1.2M",
    "change": "from suggested topics"
  }
}
```

### Content Delivery

#### Get Delivery Channels
```
GET /v1/delivery/channels
```

**Response:**
```json
{
  "channels": [
    {
      "id": "youtube",
      "name": "YouTube",
      "status": "connected",
      "subscribers": 12500
    },
    {
      "id": "twitter",
      "name": "Twitter",
      "status": "connected",
      "followers": 8900
    }
  ]
}
```

#### Publish Content
```
POST /v1/delivery/publish
```

**Request Body:**
```json
{
  "projectId": 1,
  "channels": ["youtube", "twitter"],
  "scheduleDate": "2024-01-20T10:00:00Z"
}
```

**Required Fields:**
- `projectId` (number): ID of the project to publish
- `channels` (array): Array of channel IDs to publish to

**Optional Fields:**
- `scheduleDate` (string): ISO date string for scheduled publishing

**Response (201):**
```json
{
  "id": 123,
  "projectId": 1,
  "channels": ["youtube", "twitter"],
  "status": "scheduled",
  "scheduleDate": "2024-01-20T10:00:00Z",
  "createdAt": "2024-01-16T10:00:00Z"
}
```

### Content Management

#### Generate Content Drafts
```
POST /v1/content/generate-drafts
```

**Request Body:**
```json
{
  "count": 5,
  "category": "Technology",
  "keywords": ["AI", "React"]
}
```

**Optional Fields:**
- `count` (number): Number of drafts to generate (1-20, default: 5)
- `category` (string): Content category filter
- `keywords` (array): Specific keywords to focus on

**Response (201):**
```json
{
  "success": true,
  "message": "5 new drafts generated successfully",
  "drafts": [
    {
      "id": 1234,
      "title": "AI-Powered React: The Complete 2025 Guide",
      "content": "Comprehensive guide content...",
      "status": "pending",
      "category": "Technology",
      "created_at": "2025-01-16T10:00:00Z",
      "source_keywords": ["AI", "React", "Frontend"],
      "estimated_read_time": "8 min read",
      "difficulty": "Intermediate",
      "target_audience": "Developers, Software Engineers"
    }
  ],
  "drafts_count": 5,
  "generated_at": "2025-01-16T10:00:00Z"
}
```

**Frontend Integration Example:**
```javascript
const generateDrafts = async (options = {}) => {
  try {
    const response = await fetch('http://localhost:3001/v1/content/generate-drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to generate drafts:', error);
    throw error;
  }
};
```

#### Get Content Drafts
```
GET /v1/content/drafts?status=pending&category=Technology&limit=10
```

**Query Parameters:**
- `status` (optional): Filter by draft status ("pending", "approved", "rejected", "published")
- `category` (optional): Filter by content category
- `limit` (optional): Maximum number of drafts to return (default: 10)

**Response:**
```json
{
  "success": true,
  "drafts": [
    {
      "id": 1,
      "title": "AI Video Generation: The Complete 2025 Guide",
      "content": "Comprehensive guide to AI video generation...",
      "status": "pending",
      "category": "AI",
      "created_at": "2025-08-27T18:00:00Z",
      "source_keywords": ["AI Video Generation", "AI", "Video"],
      "estimated_read_time": "8 min read",
      "difficulty": "Advanced",
      "target_audience": "Content Creators, Tech Enthusiasts"
    }
  ],
  "total": 2,
  "filters": { "status": "pending", "category": "Technology", "limit": 10 }
}
```

#### Update Draft
```
PUT /v1/content/drafts/:id
```

**Request Body:**
```json
{
  "status": "approved",
  "title": "Updated Draft Title",
  "content": "Updated content..."
}
```

**Valid Status Values:**
- `pending`: Draft is waiting for review
- `approved`: Draft has been approved for publishing
- `rejected`: Draft has been rejected
- `published`: Draft has been published

**Response (200):**
```json
{
  "success": true,
  "message": "Draft 1 updated successfully",
  "draft": {
    "id": 1,
    "title": "Updated Draft Title",
    "content": "Updated content...",
    "status": "approved",
    "updated_at": "2025-01-16T10:30:00Z",
    "category": "Technology"
  }
}
```

#### Delete Draft
```
DELETE /v1/content/drafts/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Draft 1 deleted successfully",
  "deleted_id": 1
}
```

#### Get Content Statistics
```
GET /v1/content/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_drafts": 12,
    "pending_drafts": 8,
    "approved_drafts": 3,
    "published_drafts": 1,
    "categories": {
      "AI": 5,
      "Technology": 4,
      "General": 3
    },
    "recent_activity": [
      {
        "action": "generated",
        "count": 5,
        "timestamp": "2025-01-16T10:00:00Z"
      }
    ],
    "generation_metrics": {
      "avg_generation_time": "2.3s",
      "success_rate": "98%",
      "popular_keywords": ["AI", "React", "Content Creation"]
    }
  },
  "last_updated": "2025-01-16T10:00:00Z"
}
```

### Source Crawling

#### Crawl Specific Source
```
POST /v1/sources/:id/crawl
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully crawled Tech Channel",
  "data": {
    "sourceId": 1,
    "channelName": "Tech Channel",
    "videosFound": 25,
    "trends": [
      {
        "keyword": "ai",
        "mentions": 8,
        "growth": "+120%",
        "category": "Technology"
      }
    ],
    "lastCrawled": "2025-01-16T10:00:00Z",
    "videos": [
      {
        "title": "Latest AI Developments",
        "url": "https://youtube.com/watch?v=abc123",
        "publishedAt": "2025-01-15T12:00:00Z"
      }
    ]
  }
}
```

#### Crawl All Active Sources
```
POST /v1/sources/crawl-all
```

**Response (200):**
```json
{
  "success": true,
  "message": "Crawled 3 sources: 2 succeeded, 1 failed",
  "summary": {
    "total_sources": 3,
    "successful_crawls": 2,
    "failed_crawls": 1,
    "total_trends_extracted": 15,
    "completed_at": "2025-01-16T10:00:00Z"
  },
  "results": [
    {
      "sourceId": 1,
      "sourceName": "Tech Channel",
      "type": "YouTube",
      "status": "success",
      "videosFound": 25,
      "trendsExtracted": 8
    }
  ],
  "trending_keywords": [
    {
      "keyword": "ai",
      "mentions": 15,
      "growth": "+120%",
      "category": "Technology"
    }
  ]
}
```

### Twitter Integration

#### Check Twitter Connection
```
GET /v1/twitter/status
```

**Response:**
```json
{
  "connected": true,
  "last_checked": "2025-01-16T10:00:00Z",
  "api_version": "v2",
  "rate_limit": {
    "remaining": 300,
    "reset_at": "2025-01-16T10:15:00Z"
  }
}
```

#### Post Single Tweet
```
POST /v1/twitter/tweet
```

**Request Body:**
```json
{
  "text": "Check out this amazing AI tool!",
  "hashtags": ["AI", "tech", "innovation"],
  "url": "https://example.com/ai-tool"
}
```

**Required Fields:**
- `text` (string): Tweet content (max 280 characters)

**Optional Fields:**
- `hashtags` (array): Hashtags to include
- `url` (string): URL to include in tweet

**Response (201):**
```json
{
  "success": true,
  "tweet": {
    "id": "tweet_1705401600000",
    "text": "Check out this amazing AI tool!\n\n🔗 https://example.com/ai-tool\n\n#AI #tech #innovation",
    "created_at": "2025-01-16T10:00:00Z",
    "url": "https://twitter.com/user/status/tweet_1705401600000",
    "public_metrics": {
      "retweet_count": 0,
      "like_count": 0,
      "reply_count": 0,
      "quote_count": 0
    }
  },
  "formatted_text": "Check out this amazing AI tool!\n\n🔗 https://example.com/ai-tool\n\n#AI #tech #innovation",
  "metadata": {
    "original_length": 85,
    "truncated": false,
    "hashtags": ["AI", "tech", "innovation"],
    "source_url": "https://example.com/ai-tool"
  }
}
```

#### Post Twitter Thread
```
POST /v1/twitter/thread
```

**Request Body:**
```json
{
  "tweets": [
    "This is the first tweet in my thread about AI developments.",
    "Here's the second tweet with more details about the technology.",
    "Finally, here are my conclusions and recommendations."
  ],
  "hashtags": ["AI", "thread", "tech"]
}
```

**Required Fields:**
- `tweets` (array): Array of tweet texts for the thread

**Optional Fields:**
- `hashtags` (array): Hashtags to add to the last tweet

**Response (201):**
```json
{
  "success": true,
  "thread": {
    "success": true,
    "thread_id": "tweet_1705401600000",
    "tweets": [
      {
        "id": "tweet_1705401600000",
        "text": "1/3 This is the first tweet in my thread about AI developments.",
        "thread_position": 1,
        "is_thread": true,
        "created_at": "2025-01-16T10:00:00Z"
      },
      {
        "id": "tweet_1705401600001",
        "text": "2/3 Here's the second tweet with more details about the technology.",
        "thread_position": 2,
        "is_thread": true,
        "created_at": "2025-01-16T10:00:01Z"
      },
      {
        "id": "tweet_1705401600002",
        "text": "3/3 Finally, here are my conclusions and recommendations.\n\n#AI #thread #tech",
        "thread_position": 3,
        "is_thread": true,
        "created_at": "2025-01-16T10:00:02Z"
      }
    ],
    "total_tweets": 3
  }
}
```

### Refresh Analytics Trends
```
POST /v1/analytics/refresh-trends?source_based=true
```

**Query Parameters:**
- `source_based` (optional): `true` to ensure trends come from real source data

**Response (200):**
```json
{
  "success": true,
  "message": "Trends refreshed successfully",
  "trends": [
    {
      "keyword": "ai",
      "mentions": 15,
      "growth": "+120%",
      "category": "Technology"
    }
  ],
  "refreshed_at": "2025-01-16T10:00:00Z"
}
```

### User Management

#### Get User Profile
```
GET /v1/user/profile
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "/api/user/avatar",
  "subscription": "pro",
  "joinedAt": "2023-06-15T00:00:00Z"
}
```

#### Update User Profile
```
PUT /v1/user/profile
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Note:** Fields `id` and `joinedAt` are read-only and will be ignored in updates.

## Error Handling

All API endpoints return consistent error responses:

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Error Codes
- `INVALID_REQUEST` (400): Bad request, validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Access denied
- `NOT_FOUND` (404): Resource not found
- `INTERNAL_ERROR` (500): Server error

### Frontend Error Handling Pattern
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // API returned an error response
    const { code, message } = error.response.data.error;
    
    switch (code) {
      case 'INVALID_REQUEST':
        showValidationError(message);
        break;
      case 'NOT_FOUND':
        showNotFoundError(message);
        break;
      case 'INTERNAL_ERROR':
        showServerError('Something went wrong. Please try again.');
        break;
      default:
        showGenericError(message);
    }
  } else {
    // Network or other error
    showNetworkError('Unable to connect to the server');
  }
};
```

## Frontend Integration Patterns

### 1. API Client Class
```javascript
class APIClient {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Sources
  async getSources() {
    const data = await this.request('/v1/sources');
    return data.sources;
  }

  async createSource(sourceData) {
    return this.request('/v1/sources', {
      method: 'POST',
      body: sourceData,
    });
  }

  async updateSourceStatus(id, status) {
    return this.request(`/v1/sources/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  async deleteSource(id) {
    return this.request(`/v1/sources/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects
  async getProjects() {
    const data = await this.request('/v1/projects');
    return data.projects;
  }

  async createProject(projectData) {
    return this.request('/v1/projects', {
      method: 'POST',
      body: projectData,
    });
  }

  async updateProject(id, updates) {
    return this.request(`/v1/projects/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteProject(id) {
    return this.request(`/v1/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getTopicAnalytics(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/v1/analytics/topics?${params}`);
  }

  async getTrends() {
    return this.request('/v1/analytics/trends');
  }

  async getEfficiencyMetrics() {
    return this.request('/v1/analytics/efficiency');
  }

  // Statistics
  async getUsageStats() {
    return this.request('/v1/stats/usage');
  }

  // Delivery
  async getDeliveryChannels() {
    return this.request('/v1/delivery/channels');
  }

  async publishContent(publishData) {
    return this.request('/v1/delivery/publish', {
      method: 'POST',
      body: publishData,
    });
  }

  // Content Management
  async generateContentDrafts(options = {}) {
    return this.request('/v1/content/generate-drafts', {
      method: 'POST',
      body: options,
    });
  }

  async getContentDrafts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/v1/content/drafts?${params}`);
  }

  async updateDraft(id, updates) {
    return this.request(`/v1/content/drafts/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteDraft(id) {
    return this.request(`/v1/content/drafts/${id}`, {
      method: 'DELETE',
    });
  }

  async getContentStats() {
    return this.request('/v1/content/stats');
  }

  // Source Crawling
  async crawlSource(id) {
    return this.request(`/v1/sources/${id}/crawl`, {
      method: 'POST',
    });
  }

  async crawlAllSources() {
    return this.request('/v1/sources/crawl-all', {
      method: 'POST',
    });
  }

  // Twitter Integration
  async getTwitterStatus() {
    return this.request('/v1/twitter/status');
  }

  async postTweet(tweetData) {
    return this.request('/v1/twitter/tweet', {
      method: 'POST',
      body: tweetData,
    });
  }

  async postTwitterThread(threadData) {
    return this.request('/v1/twitter/thread', {
      method: 'POST',
      body: threadData,
    });
  }

  async refreshTrends(options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/v1/analytics/refresh-trends?${params}`, {
      method: 'POST',
    });
  }

  // User
  async getUserProfile() {
    return this.request('/v1/user/profile');
  }

  async updateUserProfile(updates) {
    return this.request('/v1/user/profile', {
      method: 'PUT',
      body: updates,
    });
  }
}

// Usage
const api = new APIClient();

// Example: Fetch and display sources
const loadSources = async () => {
  try {
    const sources = await api.getSources();
    displaySources(sources);
  } catch (error) {
    showError('Failed to load sources');
  }
};
```

### 2. React Hooks Integration
```javascript
// Custom hook for sources
import { useState, useEffect } from 'react';

const useSources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await api.getSources();
      setSources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const addSource = async (sourceData) => {
    try {
      const newSource = await api.createSource(sourceData);
      setSources(prev => [...prev, newSource]);
      return newSource;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSourceStatus = async (id, status) => {
    try {
      const updatedSource = await api.updateSourceStatus(id, status);
      setSources(prev => 
        prev.map(source => 
          source.id === id ? updatedSource : source
        )
      );
      return updatedSource;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeSource = async (id) => {
    try {
      await api.deleteSource(id);
      setSources(prev => prev.filter(source => source.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const crawlSource = async (id) => {
    try {
      return await api.crawlSource(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    sources,
    loading,
    error,
    refetch: fetchSources,
    addSource,
    updateSourceStatus,
    removeSource,
    crawlSource,
  };
};

// Component usage
const SourcesPage = () => {
  const { sources, loading, error, addSource, updateSourceStatus, crawlSource } = useSources();

  if (loading) return <div>Loading sources...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {sources.map(source => (
        <SourceCard 
          key={source.id} 
          source={source} 
          onStatusChange={(status) => updateSourceStatus(source.id, status)}
          onCrawl={() => crawlSource(source.id)}
        />
      ))}
    </div>
  );
};

// Custom hook for content management
const useContentDrafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrafts = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await api.getContentDrafts(filters);
      setDrafts(data.drafts);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const generateDrafts = async (options = {}) => {
    try {
      const result = await api.generateContentDrafts(options);
      // Refresh drafts after generation
      await fetchDrafts();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateDraft = async (id, updates) => {
    try {
      const updatedDraft = await api.updateDraft(id, updates);
      setDrafts(prev => 
        prev.map(draft => 
          draft.id === id ? updatedDraft.draft : draft
        )
      );
      return updatedDraft;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteDraft = async (id) => {
    try {
      await api.deleteDraft(id);
      setDrafts(prev => prev.filter(draft => draft.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    drafts,
    loading,
    error,
    refetch: fetchDrafts,
    generateDrafts,
    updateDraft,
    deleteDraft,
  };
};

// Custom hook for Twitter integration
const useTwitter = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const statusData = await api.getTwitterStatus();
      setStatus(statusData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const postTweet = async (tweetData) => {
    try {
      const result = await api.postTweet(tweetData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const postThread = async (threadData) => {
    try {
      const result = await api.postTwitterThread(threadData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    status,
    loading,
    error,
    checkStatus,
    postTweet,
    postThread,
  };
};
```

### 3. State Management Integration (Redux/Zustand)
```javascript
// Zustand store example
import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Sources state
  sources: [],
  sourcesLoading: false,
  sourcesError: null,

  // Content state
  drafts: [],
  draftsLoading: false,
  draftsError: null,

  // Twitter state
  twitterStatus: null,
  twitterLoading: false,
  twitterError: null,

  // Actions - Sources
  fetchSources: async () => {
    set({ sourcesLoading: true, sourcesError: null });
    try {
      const sources = await api.getSources();
      set({ sources, sourcesLoading: false });
    } catch (error) {
      set({ sourcesError: error.message, sourcesLoading: false });
    }
  },

  addSource: async (sourceData) => {
    try {
      const newSource = await api.createSource(sourceData);
      set(state => ({
        sources: [...state.sources, newSource]
      }));
      return newSource;
    } catch (error) {
      set({ sourcesError: error.message });
      throw error;
    }
  },

  crawlAllSources: async () => {
    try {
      const result = await api.crawlAllSources();
      // Refresh sources to get updated lastCrawled times
      get().fetchSources();
      return result;
    } catch (error) {
      set({ sourcesError: error.message });
      throw error;
    }
  },

  // Actions - Content
  fetchDrafts: async (filters = {}) => {
    set({ draftsLoading: true, draftsError: null });
    try {
      const data = await api.getContentDrafts(filters);
      set({ drafts: data.drafts, draftsLoading: false });
    } catch (error) {
      set({ draftsError: error.message, draftsLoading: false });
    }
  },

  generateDrafts: async (options = {}) => {
    try {
      const result = await api.generateContentDrafts(options);
      // Refresh drafts list
      await get().fetchDrafts();
      return result;
    } catch (error) {
      set({ draftsError: error.message });
      throw error;
    }
  },

  updateDraft: async (id, updates) => {
    try {
      const result = await api.updateDraft(id, updates);
      set(state => ({
        drafts: state.drafts.map(draft => 
          draft.id === id ? result.draft : draft
        )
      }));
      return result;
    } catch (error) {
      set({ draftsError: error.message });
      throw error;
    }
  },

  // Actions - Twitter
  checkTwitterStatus: async () => {
    set({ twitterLoading: true, twitterError: null });
    try {
      const status = await api.getTwitterStatus();
      set({ twitterStatus: status, twitterLoading: false });
    } catch (error) {
      set({ twitterError: error.message, twitterLoading: false });
    }
  },

  postTweet: async (tweetData) => {
    try {
      const result = await api.postTweet(tweetData);
      return result;
    } catch (error) {
      set({ twitterError: error.message });
      throw error;
    }
  },
}));
```

### 4. Complete Workflow Examples

#### Content Creation Workflow
```javascript
// Complete workflow: Generate → Review → Publish
const ContentWorkflow = () => {
  const { drafts, generateDrafts, updateDraft } = useContentDrafts();
  const { postTweet } = useTwitter();
  const { publishContent } = useDelivery();

  const handleContentCreation = async () => {
    try {
      // Step 1: Generate content drafts
      const result = await generateDrafts({
        count: 3,
        category: "Technology",
        keywords: ["AI", "React"]
      });
      
      console.log(`Generated ${result.drafts_count} drafts`);
      
      // Step 2: Auto-approve first draft for demo
      const firstDraft = result.drafts[0];
      await updateDraft(firstDraft.id, { status: "approved" });
      
      // Step 3: Publish to Twitter
      const tweetResult = await postTweet({
        text: firstDraft.title,
        hashtags: firstDraft.source_keywords.slice(0, 3),
        url: "https://yoursite.com/blog/" + firstDraft.id
      });
      
      console.log(`Published to Twitter: ${tweetResult.tweet.url}`);
      
    } catch (error) {
      console.error('Workflow error:', error);
    }
  };

  return (
    <button onClick={handleContentCreation}>
      Generate & Publish Content
    </button>
  );
};
```

#### Source Management Workflow  
```javascript
// Complete workflow: Add Source → Crawl → Analyze Trends
const SourceManagement = () => {
  const { addSource, crawlSource } = useSources();
  const { refreshTrends } = useAnalytics();

  const handleSourceWorkflow = async (sourceData) => {
    try {
      // Step 1: Add new source
      const newSource = await addSource(sourceData);
      console.log(`Added source: ${newSource.name}`);
      
      // Step 2: Crawl the source immediately
      const crawlResult = await crawlSource(newSource.id);
      console.log(`Crawled: Found ${crawlResult.data.videosFound} items`);
      
      // Step 3: Refresh trends with new data
      const trendsResult = await refreshTrends({ source_based: true });
      console.log(`Updated trends: ${trendsResult.trends.length} trending topics`);
      
      return {
        source: newSource,
        crawlData: crawlResult.data,
        trends: trendsResult.trends
      };
      
    } catch (error) {
      console.error('Source workflow error:', error);
      throw error;
    }
  };

  return { handleSourceWorkflow };
};
```

#### Analytics Dashboard Integration
```javascript
// Dashboard component using multiple API endpoints
const Dashboard = () => {
  const [usageStats, setUsageStats] = useState(null);
  const [contentStats, setContentStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Parallel API calls for better performance
        const [usage, content, trendData] = await Promise.all([
          api.getUsageStats(),
          api.getContentStats(),
          api.getTrends()
        ]);
        
        setUsageStats(usage);
        setContentStats(content.stats);
        setTrends(trendData.trends);
        
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="dashboard">
      <StatsGrid stats={usageStats} />
      <ContentOverview stats={contentStats} />
      <TrendsChart trends={trends} />
    </div>
  );
};
```

## Development Environment Setup

### 1. Environment Variables
Create a `.env` file in your frontend project:
```bash
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_API_VERSION=v1
```

### 2. Development Proxy (Create React App)
Add to `package.json`:
```json
{
  "proxy": "http://localhost:3001"
}
```

### 3. Vite Configuration
Add to `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

## Testing API Integration

### 1. Unit Tests
```javascript
// Mock API responses for testing
const mockApi = {
  getSources: jest.fn(),
  createSource: jest.fn(),
  // ... other methods
};

describe('useSources hook', () => {
  it('should fetch sources on mount', async () => {
    const mockSources = [{ id: 1, name: 'Test Source' }];
    mockApi.getSources.mockResolvedValue(mockSources);
    
    const { result, waitForNextUpdate } = renderHook(() => useSources());
    
    await waitForNextUpdate();
    
    expect(result.current.sources).toEqual(mockSources);
    expect(mockApi.getSources).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Tests
```javascript
// Test actual API endpoints
describe('API Integration', () => {
  beforeAll(async () => {
    // Ensure test server is running
    await fetch('http://localhost:3001/health');
  });

  it('should create and retrieve sources', async () => {
    const sourceData = {
      url: 'https://test.com/feed',
      type: 'RSS',
      name: 'Test Source'
    };

    const created = await api.createSource(sourceData);
    expect(created.name).toBe('Test Source');

    const sources = await api.getSources();
    expect(sources).toContainEqual(
      expect.objectContaining({ name: 'Test Source' })
    );
  });
});
```

## Performance Considerations

### 1. Request Caching
```javascript
// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cachedRequest = async (key, requestFn) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await requestFn();
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
};

// Usage
const getCachedSources = () => 
  cachedRequest('sources', () => api.getSources());
```

### 2. Request Debouncing
```javascript
// Debounce search requests
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const results = await api.searchContent(query);
  setSearchResults(results);
}, 300);
```

### 3. Pagination Support
```javascript
// Add pagination support to API client
async getProjects(page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit });
  return this.request(`/v1/projects?${params}`);
}
```

## Security Best Practices

1. **Input Validation**: Always validate user input before sending to API
2. **Error Handling**: Never expose sensitive error details to users
3. **HTTPS**: Use HTTPS in production environments
4. **API Keys**: Store API keys securely (environment variables, not in code)
5. **CORS**: Ensure CORS is properly configured for your domain

## Advanced Integration Patterns

### 1. Real-time Updates with Polling
```javascript
// Polling hook for real-time updates
const usePolling = (apiCall, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiCall();
        setData(result);
      } catch (error) {
        console.error('Polling error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [apiCall, interval]);

  return { data, loading };
};

// Usage for live trends
const LiveTrends = () => {
  const { data: trends } = usePolling(
    () => api.getTrends(),
    60000 // Update every minute
  );

  return (
    <div>
      {trends?.trends.map(trend => (
        <TrendCard key={trend.keyword} trend={trend} />
      ))}
    </div>
  );
};
```

### 2. Optimistic Updates
```javascript
// Optimistic UI updates for better UX
const useOptimisticSources = () => {
  const [sources, setSources] = useState([]);
  
  const updateSourceStatusOptimistic = async (id, newStatus) => {
    // Optimistically update UI
    setSources(prev => 
      prev.map(source => 
        source.id === id 
          ? { ...source, status: newStatus }
          : source
      )
    );

    try {
      // Make API call
      await api.updateSourceStatus(id, newStatus);
    } catch (error) {
      // Revert optimistic update on failure
      setSources(prev => 
        prev.map(source => 
          source.id === id 
            ? { ...source, status: source.status } // Revert
            : source
        )
      );
      throw error;
    }
  };

  return { sources, updateSourceStatusOptimistic };
};
```

### 3. Batch Operations
```javascript
// Batch API operations for efficiency
const useBatchOperations = () => {
  const batchUpdateDrafts = async (updates) => {
    const promises = updates.map(({ id, data }) => 
      api.updateDraft(id, data)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      return {
        successful: successful.length,
        failed: failed.length,
        results: results
      };
    } catch (error) {
      console.error('Batch operation error:', error);
      throw error;
    }
  };

  return { batchUpdateDrafts };
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend URL is in the API's CORS allowlist (`localhost:3000`, `localhost:5173`)
2. **404 Errors**: Check endpoint URLs and API version (`/v1/` prefix required)
3. **Validation Errors**: Verify required fields and data types
4. **Network Errors**: Check if the API server is running on port 3001
5. **Content Generation Delays**: Content generation can take 2-3 seconds, implement loading states
6. **Twitter Rate Limits**: Check `/v1/twitter/status` for rate limit information

### Debug Mode
```javascript
// Enhanced API client with debug logging
class DebugAPIClient extends APIClient {
  async request(endpoint, options = {}) {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    if (options.body) {
      console.log('📤 Request Body:', options.body);
    }
    
    try {
      const result = await super.request(endpoint, options);
      console.log('📥 Response:', result);
      return result;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }
}

// Usage in development
const api = new DebugAPIClient('http://localhost:3001');
```

### Health Monitoring
```javascript
// Monitor API health and connectivity
const useAPIHealth = () => {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  const checkHealth = async () => {
    try {
      const health = await fetch('http://localhost:3001/health');
      const isOk = health.ok;
      setIsHealthy(isOk);
      setLastCheck(new Date().toISOString());
      return isOk;
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date().toISOString());
      return false;
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, lastCheck, checkHealth };
};
```

This comprehensive guide provides all the information needed to successfully integrate your frontend application with the Content Management Dashboard API, including advanced patterns for production-ready applications.
