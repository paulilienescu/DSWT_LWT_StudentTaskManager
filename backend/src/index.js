import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers, users } from "./schema/resolvers.js";

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
