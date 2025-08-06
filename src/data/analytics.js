// Mock analytics data
const usageStats = {
  topicsAccepted: {
    value: 18,
    change: "+2 from last month"
  },
  avgViewsUplift: {
    value: "+28%",
    change: "vs your baseline"
  },
  researchTimeSaved: {
    value: "4.2h",
    change: "per accepted topic"
  },
  totalViews: {
    value: "1.2M",
    change: "from suggested topics"
  }
};

const topics = [
  {
    id: 1,
    title: "AI-Powered Code Reviews",
    status: "accepted",
    views: 45200,
    engagement: 8.7,
    uplift: "+32%",
    suggestedDate: "2024-01-10T00:00:00Z",
    publishedDate: "2024-01-12T00:00:00Z"
  },
  {
    id: 2,
    title: "JavaScript Performance Tips",
    status: "accepted",
    views: 38900,
    engagement: 7.9,
    uplift: "+25%",
    suggestedDate: "2024-01-08T00:00:00Z",
    publishedDate: "2024-01-10T00:00:00Z"
  },
  {
    id: 3,
    title: "Docker Container Optimization",
    status: "pending",
    views: 0,
    engagement: 0,
    uplift: null,
    suggestedDate: "2024-01-16T00:00:00Z",
    publishedDate: null
  }
];

const trends = [
  {
    keyword: "AI",
    growth: "+45%",
    volume: 25000,
    category: "Technology"
  },
  {
    keyword: "React",
    growth: "+22%",
    volume: 18500,
    category: "Frontend"
  },
  {
    keyword: "Docker",
    growth: "+18%",
    volume: 15200,
    category: "DevOps"
  }
];

const efficiencyMetrics = {
  avgResearchTime: {
    current: "4.2h",
    previous: "8.5h",
    improvement: "50.6%"
  },
  publishingFrequency: {
    current: "3x/week",
    previous: "2x/week",
    improvement: "+50%"
  },
  topicAcceptanceRate: {
    current: "72%",
    previous: "45%",
    improvement: "+27%"
  }
};

const deliveryChannels = [
  {
    id: 1,
    name: "YouTube",
    type: "video",
    status: "connected",
    lastSync: "2024-01-15T12:00:00Z"
  },
  {
    id: 2,
    name: "Blog",
    type: "article",
    status: "connected",
    lastSync: "2024-01-15T11:30:00Z"
  },
  {
    id: 3,
    name: "Twitter",
    type: "social",
    status: "error",
    lastSync: "2024-01-14T15:45:00Z"
  }
];

const userProfile = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  avatar: "/api/user/avatar",
  subscription: "pro",
  joinedAt: "2023-06-15T00:00:00Z"
};

const getUsageStats = () => usageStats;

const getTopics = (filters = {}) => {
  let filteredTopics = [...topics];
  
  if (filters.status) {
    filteredTopics = filteredTopics.filter(topic => topic.status === filters.status);
  }
  
  return {
    topics: filteredTopics,
    summary: {
      totalTopics: topics.length,
      acceptedTopics: topics.filter(t => t.status === 'accepted').length,
      avgUplift: 28,
      totalViews: 1200000
    }
  };
};

const getTrends = () => ({ trends, timeRange: "30d" });

const getEfficiencyMetrics = () => ({ metrics: efficiencyMetrics });

const getDeliveryChannels = () => ({ channels: deliveryChannels });

const getUserProfile = () => userProfile;

module.exports = {
  getUsageStats,
  getTopics,
  getTrends,
  getEfficiencyMetrics,
  getDeliveryChannels,
  getUserProfile
};