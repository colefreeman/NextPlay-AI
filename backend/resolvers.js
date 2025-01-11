const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { driver } = require('./neo4j-driver');

const resolvers = {
  Query: {
    login: async (_, { email, password }) => {
      const session = driver.session();
      try {
        // Fetch the user by email
        const result = await session.run(
          'MATCH (u:User {email: $email}) RETURN u',
          { email }
        );
        const user = result.records[0]?.get('u').properties;
        if (!user) throw new Error('User not found');

        // Verify the password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error('Invalid password');

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Return the token
        return token;
      } finally {
        session.close();
      }
    },
  },
  Mutation: {
    registerUser: async (_, { name, email, password, role }) => {
      const session = driver.session();
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique user ID
        const userId = uuidv4();

        // Create the user in the database
        await session.run(
          `
          CREATE (u:User {
            id: $id, name: $name, email: $email,
            password: $password, role: $role
          })
          `,
          { id: userId, name, email, password: hashedPassword, role }
        );

        // Return the newly created user (excluding the password)
        return { id: userId, name, email, role };
      } finally {
        session.close();
      }
    },
    linkGoogleAccount: async (_, { userId, googleId }) => {
      const session = driver.session();
      try {
        // Link the Google account to the user
        const result = await session.run(
          'MATCH (u:User {id: $userId}) SET u.googleId = $googleId RETURN u',
          { userId, googleId }
        );

        // Return the updated user
        return result.records[0]?.get('u').properties;
      } finally {
        session.close();
      }
    },
    linkInstagramAccount: async (_, { userId, instagramId }) => {
      const session = driver.session();
      try {
        // Link the Instagram account to the user
        const result = await session.run(
          'MATCH (u:User {id: $userId}) SET u.instagramId = $instagramId RETURN u',
          { userId, instagramId }
        );

        // Return the updated user
        return result.records[0]?.get('u').properties;
      } finally {
        session.close();
      }
    },
  },
};

module.exports = resolvers;