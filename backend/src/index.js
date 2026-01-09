import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// Mock "database" in memory
const users = []; // { id, username, password }

const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
  }

  type Query {
    hello: String
     me: User
  }

  type Mutation {
    register(username: String!, password: String!): String!
    login(username: String!, password: String!): String!
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello World!",
    me: (_, __, ctx) => ctx.user,
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
        password, // (for now plain text - later we can hash)
      };
      users.push(newUser);

      // simple token for now
      return `token-${newUser.id}`;
    },

    login: (_, { username, password }) => {
      const user = users.find((u) => u.username === username);
      if (!user) throw new Error("Invalid credentials");
      if (user.password !== password) throw new Error("Invalid credentials");

      return `token-${user.id}`;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req.headers.authorization || "";
    // expecting: "Bearer token-1"
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    let user = null;
    if (token && token.startsWith("token-")) {
      const userId = token.replace("token-", "");
      user = users.find((u) => u.id === userId) || null;
    }

    return { user };
  },
});

console.log(`Server ready at ${url}`);
