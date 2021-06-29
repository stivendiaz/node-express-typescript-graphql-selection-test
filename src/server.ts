import 'graphql-import-node';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'apollo-server';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import user from './graphql/schemas/user.graphql';
import userResolver from './graphql/resolvers/userResolver';
import { validatePrepopulate } from './scripts/fillDatabase';

const mongodb = new MongoMemoryServer();

const mongooseOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  useCreateIndex: true,
};

mongodb.getUri().then( async uri => {
  await mongoose.connect(uri, mongooseOpts);
  await validatePrepopulate();
});

const types = mergeTypeDefs([user]);
const resolvers = mergeResolvers([userResolver]);

const schema = makeExecutableSchema({
  typeDefs: types,
  resolvers: resolvers,
});

const server = new ApolloServer({
  schema: schema,
  playground: true,
  introspection: true,
  tracing: true,
  engine: {
    debugPrintReports: true,
  },
});

const app = express();
server.applyMiddleware({ app });

const port = 4000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}.`);
  console.log(`🔯 Graphql endpoint running at http://localhost:${port}/graphql`);
});
