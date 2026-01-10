// Mock "database" in memory
const users = []; // { id, username, password }
const projects = []; // { id, name, ownerId }

export const resolvers = {
  Query: {
    me: (_, __, ctx) => ctx.user,

    projects: (_, __, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return projects.filter(p => p.ownerId === ctx.user.id);
    }
  },

  Mutation: {
    register: (_, { username, password }) => {
      if (!username.trim()) throw new Error("Username is required");
      if (password.length < 6)
        throw new Error("Password must be at least 6 characters");

      const exists = users.some((u) => u.username === username);
      if (exists) throw new Error("Username already exists");

      const newUser = {
        id: String(users.length + 1),
        username,
        password,
      };
      users.push(newUser);

      return `token-${newUser.id}`;
    },

    login: (_, { username, password }) => {
      const user = users.find((u) => u.username === username);
      if (!user) throw new Error("Invalid credentials");
      if (user.password !== password) throw new Error("Invalid credentials");

      return `token-${user.id}`;
    },

    createProject: (_, { name }, ctx) => {
        if(!ctx.user) throw new Error("Not authenticated");
        if (!name.trim()) throw new Error("Project name is required");

        const newProject = {
            id: String(projects.length + 1),
            name,
            ownerId: ctx.user.id,
        };

        projects.push(newProject);
        return newProject;
    },

    deleteProject: (_, { id }, ctx) => {
        if(!ctx.user) throw new Error("Not authenticated");

        const projectIndex = projects.findIndex(p => p.id === id && p.ownerId === ctx.user.id);
        if(projectIndex === -1) throw new Error("Project not found");

        projects.splice(projectIndex, 1);
        return true;
    }
  },

  Project: {
    owner: (project) => {
        return users.find(u => u.id === project.ownerId);
    }
  },
};

export { users, projects };
