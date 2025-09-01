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
  "plan": "Pro",
  "joinedAt": "2023-12-01T00:00:00Z",
  "preferences": {
    "notifications": true,
    "autoPublish": false
  }
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
  "preferences": {
    "notifications": false,
    "autoPublish": true
  }
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

  return {
    sources,
    loading,
    error,
    refetch: fetchSources,
    addSource,
    updateSourceStatus,
    removeSource,
  };
};

// Component usage
const SourcesPage = () => {
  const { sources, loading, error, addSource, updateSourceStatus } = useSources();

  if (loading) return <div>Loading sources...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {sources.map(source => (
        <SourceCard 
          key={source.id} 
          source={source} 
          onStatusChange={(status) => updateSourceStatus(source.id, status)}
        />
      ))}
    </div>
  );
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

  // Actions
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

  // Similar patterns for other entities...
}));
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

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend URL is in the API's CORS allowlist
2. **404 Errors**: Check endpoint URLs and API version
3. **Validation Errors**: Verify required fields and data types
4. **Network Errors**: Check if the API server is running

### Debug Mode
```javascript
// Enable debug logging
const api = new APIClient('http://localhost:3001', { debug: true });
```

This comprehensive guide should provide all the information needed to successfully integrate your frontend application with the Content Management Dashboard API.
