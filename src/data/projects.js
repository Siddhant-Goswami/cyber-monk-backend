// In-memory projects data store
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
  },
  {
    id: 2,
    title: "AI Development Tutorials",
    description: "Educational content on AI development",
    status: "active",
    totalViews: 89000,
    engagement: 9.2,
    lastUpdated: "2024-01-16T09:15:00Z",
    thumbnail: "/api/projects/2/thumbnail"
  },
  {
    id: 3,
    title: "Startup Journey Vlogs",
    description: "Behind-the-scenes startup content",
    status: "draft",
    totalViews: 12000,
    engagement: 6.8,
    lastUpdated: "2024-01-12T11:20:00Z",
    thumbnail: "/api/projects/3/thumbnail"
  }
];

let nextId = 4;

const getAll = () => projects;

const getById = (id) => projects.find(project => project.id === parseInt(id));

const create = (projectData) => {
  const newProject = {
    id: nextId++,
    title: projectData.title,
    description: projectData.description || "",
    status: "active",
    totalViews: 0,
    engagement: 0,
    lastUpdated: new Date().toISOString(),
    thumbnail: `/api/projects/${nextId - 1}/thumbnail`
  };
  projects.push(newProject);
  return newProject;
};

const update = (id, updates) => {
  const index = projects.findIndex(project => project.id === parseInt(id));
  if (index === -1) return null;
  
  projects[index] = { 
    ...projects[index], 
    ...updates, 
    lastUpdated: new Date().toISOString() 
  };
  return projects[index];
};

const deleteById = (id) => {
  const index = projects.findIndex(project => project.id === parseInt(id));
  if (index === -1) return false;
  
  projects.splice(index, 1);
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById
};