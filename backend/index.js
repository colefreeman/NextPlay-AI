const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const setupPassport = require('./passport-strategies');

const app = express();
app.use(cookieParser());
setupPassport();

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});
server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log('Server running at http://localhost:4000/graphql'));
});

// OAuth2 Routes
app.use(passport.initialize());
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const { googleId } = req.user;
    res.cookie('googleId', googleId, { httpOnly: true, secure: true });
    res.redirect('/dashboard');
  }
);

app.get('/auth/instagram', passport.authenticate('instagram'));
app.get(
  '/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res) => {
    const { instagramId } = req.user;
    res.cookie('instagramId', instagramId, { httpOnly: true, secure: true });
    res.redirect('/dashboard');
  }
);
