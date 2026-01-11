export const typeDefs = `#graphql
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }
    
  type User {
    id: ID!
    username: String!
  }

  type Project {
    id: ID!
    name: String!
    owner: User!
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    title: String!
    status: TaskStatus!
    project: Project!}

  type Query {
    me: User
    projects: [Project!]!
    tasks(projectId: ID!, status: TaskStatus, limit: Int, offset: Int): [Task!]!
  }

  type Mutation {
    register(username: String!, password: String!): String!
    login(username: String!, password: String!): String!

    createProject(name: String!): Project!
    deleteProject(id: ID!): Boolean!

    createTask(projectId: ID!, title: String!): Task!
    updateTaskStatus(taskId: ID!, status: TaskStatus!): Task!
    deleteTask(taskId: ID!): Boolean!
  }
`;
