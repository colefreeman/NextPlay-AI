require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const setupPassport = require('./passport-strategies');

// Initialize Express app and Apollo Server
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

// Middleware Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    path: '/'
  }
}));

// Passport Configuration
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

// Auth Routes
app.get('/auth/google',
  (req, res, next) => {
    console.log('Starting Google authentication...');
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);

app.get('/auth/google/callback',
  (req, res, next) => {
    console.log('Received Google callback. Query:', req.query);
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login',
    failureFlash: true
  }),
  (req, res) => {
    console.log('Authentication successful, user:', req.user);
    const { id } = req.user;
    
    res.cookie('userId', id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.redirect('http://localhost:3000/dashboard');
  }
);

app.get('/api/auth/status', (req, res) => {
  console.log('Checking auth status for user:', req.user?.id);
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/auth/logout', (req, res) => {
  console.log('Logout requested for user:', req.user?.id);
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.clearCookie('userId', { path: '/' });
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Server Startup
async function startServer() {
  try {
    await server.start();
    
    server.applyMiddleware({ 
      app,
      cors: false
    });

    app.listen(4000, () => {
      console.log('🚀 Server ready at http://localhost:4000');
      console.log(`🚀 GraphQL ready at http://localhost:4000${server.graphqlPath}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();