// Mock "database" in memory
const users = []; // { id, username, password }
const projects = []; // { id, name, ownerId }
const tasks = []; // { id, title, status, projectId }

export const resolvers = {
  Query: {
    me: (_, __, ctx) => ctx.user,

    projects: (_, __, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");
      return projects.filter(p => p.ownerId === ctx.user.id);
    },

    tasks: (_, { projectId, status }, ctx) => {
        if (!ctx.user) throw new Error("Not authenticated");

        const project = projects.find(
            p => p.id === projectId && p.ownerId === ctx.user.id
        );
        if(!project) throw new Error("Project not found");

        let projectTasks = tasks.filter(t => t.projectId === projectId);
        if(status) {
            projectTasks = projectTasks.filter(t => t.status === status);
        }
        return projectTasks;
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
    },

    createTask: (_, { projectId, title }, ctx) => {
        if(!ctx.user) throw new Error("Not authenticated");
        if(!title.trim()) throw new Error("Task title is required");

        const project = projects.find(p => p.id === projectId && p.ownerId === ctx.user.id);
        if(!project) throw new Error("Project not found");

        const newTask = {
            id: String(tasks.length + 1),
            title,
            status: "TODO",
            projectId,
        };

        tasks.push(newTask);
        return newTask;
    },

    updateTaskStatus: (_, { taskId, status }, ctx) => {
        if(!ctx.user) throw new Error("Not authenticated");

        const task = tasks.find(t => t.id === taskId);
        if(!task) throw new Error("Task not found");

        const project = projects.find(p => p.id === task.projectId);
        if (project.ownerId !== ctx.user.id) throw new Error("Not authorized");

        task.status = status;
        return task;
    },

    deleteTask: (_, { taskId }, ctx) => {
        if(!ctx.user) throw new Error("Not authenticated");

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if(taskIndex === -1) throw new Error("Task not found");

        const project = projects.find(p => p.id === tasks[taskIndex].projectId);
        if (project.ownerId !== ctx.user.id) throw new Error("Not authorized");

        tasks.splice(taskIndex, 1);
        return true;
    },
  },

  Project: {
    owner: (project) => users.find(u => u.id === project.ownerId),
    tasks: (project) => tasks.filter(t => t.projectId === project.id),
  },

  Task: {
    project: (task) => projects.find(p => p.id === task.projectId),
  }
};

export { users, projects, tasks };
