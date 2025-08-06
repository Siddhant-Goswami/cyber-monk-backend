// In-memory sources data store
let sources = [
  {
    id: 1,
    name: "Tech Channel",
    type: "YouTube",
    url: "https://youtube.com/@techchannel",
    status: "active",
    lastCrawled: "2024-01-15T10:30:00Z",
    icon: "youtube"
  },
  {
    id: 2,
    name: "AI Research Blog",
    type: "RSS",
    url: "https://airesearch.blog/feed",
    status: "active",
    lastCrawled: "2024-01-16T08:15:00Z",
    icon: "rss"
  },
  {
    id: 3,
    name: "Developer Twitter",
    type: "Twitter",
    url: "https://twitter.com/dev",
    status: "paused",
    lastCrawled: "2024-01-14T16:45:00Z",
    icon: "twitter"
  }
];

let nextId = 4;

const getAll = () => sources;

const getById = (id) => sources.find(source => source.id === parseInt(id));

const create = (sourceData) => {
  const newSource = {
    id: nextId++,
    name: sourceData.name || "Unnamed Source",
    type: sourceData.type,
    url: sourceData.url,
    status: "active",
    lastCrawled: null,
    icon: sourceData.type.toLowerCase()
  };
  sources.push(newSource);
  return newSource;
};

const update = (id, updates) => {
  const index = sources.findIndex(source => source.id === parseInt(id));
  if (index === -1) return null;
  
  sources[index] = { ...sources[index], ...updates };
  return sources[index];
};

const deleteById = (id) => {
  const index = sources.findIndex(source => source.id === parseInt(id));
  if (index === -1) return false;
  
  sources.splice(index, 1);
  return true;
};

const updateStatus = (id, status) => {
  const source = getById(id);
  if (!source) return null;
  
  source.status = status;
  return source;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById,
  updateStatus
};