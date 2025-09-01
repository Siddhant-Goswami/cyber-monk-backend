const express = require('express');
const cors = require('cors');

// Import route handlers
const sourcesRouter = require('./routes/sources');
const projectsRouter = require('./routes/projects');
const statsRouter = require('./routes/stats');
const analyticsRouter = require('./routes/analytics');
const deliveryRouter = require('./routes/delivery');
const userRouter = require('./routes/user');
const twitterRouter = require('./routes/twitter-simple');
const contentRouter = require('./routes/content');
const agentRouter = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Common frontend ports
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});


// API Routes
app.use('/v1/sources', sourcesRouter);
app.use('/v1/projects', projectsRouter);
app.use('/v1/stats', statsRouter);
app.use('/v1/analytics', analyticsRouter);
app.use('/v1/delivery', deliveryRouter);
app.use('/v1/user', userRouter);
app.use('/v1/twitter', twitterRouter);
app.use('/v1/content', contentRouter);
app.use('/api/agent', agentRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Twitter Agent Backend API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/v1`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET    /v1/sources           - List all sources');
  console.log('  POST   /v1/sources           - Create new source');
  console.log('  PUT    /v1/sources/:id/status - Update source status');
  console.log('  DELETE /v1/sources/:id       - Delete source');
  console.log('  POST   /v1/sources/:id/crawl - Crawl specific source');
  console.log('  POST   /v1/sources/crawl-all - Crawl all active sources');
  console.log('  GET    /v1/projects          - List all projects');
  console.log('  POST   /v1/projects          - Create new project');
  console.log('  PUT    /v1/projects/:id      - Update project');
  console.log('  DELETE /v1/projects/:id      - Delete project');
  console.log('  GET    /v1/stats/usage       - Usage statistics');
  console.log('  GET    /v1/analytics/topics  - Topic analytics');
  console.log('  GET    /v1/analytics/trends  - Trend data');
  console.log('  GET    /v1/analytics/efficiency - Efficiency metrics');
  console.log('  POST   /v1/analytics/refresh-trends - Refresh trending topics');
  console.log('  GET    /v1/delivery/channels - Delivery channels');
  console.log('  POST   /v1/delivery/publish  - Publish content');
  console.log('  GET    /v1/user/profile      - User profile');
  console.log('  PUT    /v1/user/profile      - Update user profile');
  console.log('  GET    /v1/twitter/status    - Check Twitter connection');
  console.log('  POST   /v1/twitter/tweet     - Post single tweet');
  console.log('  POST   /v1/twitter/thread    - Post Twitter thread');
  console.log('  POST   /v1/twitter/publish   - Publish project to Twitter');
  console.log('  POST   /v1/content/generate-drafts - Generate content drafts');
  console.log('  GET    /v1/content/drafts    - List content drafts');
  console.log('  GET    /v1/content/stats     - Content statistics');\n  console.log('');\n  console.log('Agent Integration:');\n  console.log('  POST   /api/agent/workflows        - Workflow notifications');\n  console.log('  POST   /api/agent/workflows/:id/status - Status updates');\n  console.log('  POST   /api/agent/tweets/posted   - Tweet posting notifications');\n  console.log('  POST   /api/agent/engagement      - Engagement metrics');\n  console.log('  GET    /api/agent/status          - Agent integration status');\n  console.log('  GET    /api/agent/workflows       - List all workflows');\n  console.log('  GET    /api/agent/engagement/report - Engagement analytics');
});

module.exports = app;