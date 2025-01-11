const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const setupPassport = require('./passport-strategies');

const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret', // Replace with a strong secret in your .env file
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
  })
);

// Initialize Passport and session
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }), // Pass req and res to context for authentication
});

server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log('Server running at http://localhost:4000/graphql'));
});

// OAuth2 Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const { googleId } = req.user;
    res.cookie('googleId', googleId, { httpOnly: true, secure: true });
    res.redirect('/dashboard'); // Replace '/dashboard' with your desired frontend route
  }
);

app.get('/auth/instagram', passport.authenticate('instagram'));

app.get(
  '/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res) => {
    const { instagramId } = req.user;
    res.cookie('instagramId', instagramId, { httpOnly: true, secure: true });
    res.redirect('/dashboard'); // Replace '/dashboard' with your desired frontend route
  }
);
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
      if (err) {
          console.error('Error during logout:', err);
          return res.status(500).send('Logout failed');
      }
      req.session.destroy(() => {
          res.clearCookie('connect.sid'); // Clear session cookie
          res.send('Logged out successfully');
      });
  });
});