require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors'); // Add this import
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const setupPassport = require('./passport-strategies');

const app = express();

// CORS should be one of the first middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware to parse cookies
app.use(cookieParser());

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // Added for security
    }
  })
);

// Initialize Passport and session
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

async function startServer() {
  try {
    await server.start();
    
    server.applyMiddleware({ 
      app,
      cors: false // Disable Apollo Server's CORS as we're handling it with Express
    });

    // OAuth2 Routes
    app.get('/auth/google',
      (req, res, next) => {
        console.log('Starting Google authentication...');
        next();
      },
      passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
      })
    );

    app.get(
      '/auth/google/callback',
      (req, res, next) => {
        console.log('Received Google callback');
        next();
      },
      passport.authenticate('google', { 
        failureRedirect: '/',
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
        res.redirect('http://localhost:3000/dashboard'); // Update to redirect to frontend URL
      }
    );

    // Add status endpoint for frontend auth check
    app.get('/api/auth/status', (req, res) => {
      if (req.user) {
        res.json(req.user);
      } else {
        res.status(401).json({ message: 'Not authenticated' });
      }
    });

    app.get('/auth/logout', (req, res) => {
      req.logout((err) => {
        if (err) {
          console.error('Error during logout:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        req.session.destroy(() => {
          res.clearCookie('connect.sid');
          res.clearCookie('userId');
          res.json({ message: 'Logged out successfully' });
        });
      });
    });

    // Error handling middleware should be last
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something broke!' });
    });

    app.listen(4000, () => console.log('Server running at http://localhost:4000'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();