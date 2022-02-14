const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { ApolloServer } =require('apollo-server-express')
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas')


const app = express();
const port = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

server.applyMiddleware({ app })

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);
app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

db.once('open', () => {
  app.listen(port, () => console.log(`🌍 Now listening on localhost:${port}/graphql`));
});
