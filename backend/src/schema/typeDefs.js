export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
  }

  type Project {
    id: ID!
    name: String!
    owner: User!
  }

  type Query {
    me: User
    projects: [Project!]!
  }

  type Mutation {
    register(username: String!, password: String!): String!
    login(username: String!, password: String!): String!

    createProject(name: String!): Project!
    deleteProject(id: ID!): Boolean!
  }
`;
