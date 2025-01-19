const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { driver } = require('./src/config/neo4j-driver');

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

    // New Profile Queries
    getProfile: async (_, { username }, context) => {
      // Check authentication
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (u:User {id: $userId})
          RETURN u {
            .id,
            .name,
            .email,
            .role,
            .firstName,
            .lastName,
            .bio,
            .location,
            .avatarUrl,
            .joinedDate,
            .lastActive,
            .profileUrl,
            .socialLinks,
            .skills,
            .interests
          } as profile
          `,
          { userId: username }  // Using ID instead of username to match your schema
        );
        
        if (!result.records.length) {
          throw new Error('Profile not found');
        }
        
        return result.records[0].get('profile');
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      } finally {
        session.close();
      }
    },

    getCurrentUserProfile: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      return resolvers.Query.getProfile(_, { username: context.user.id }, context);
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

        // Create the user in the database with profile fields
        await session.run(
          `
          CREATE (u:User {
            id: $id,
            name: $name,
            email: $email,
            password: $password,
            role: $role,
            joinedDate: $joinedDate,
            lastActive: $lastActive,
            firstName: $firstName,
            lastName: $lastName
          })
          `,
          {
            id: userId,
            name,
            email,
            password: hashedPassword,
            role,
            joinedDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            firstName: name.split(' ')[0], // Default to first part of name
            lastName: name.split(' ').slice(1).join(' ') // Default to rest of name
          }
        );

        return { id: userId, name, email, role };
      } finally {
        session.close();
      }
    },

    linkGoogleAccount: async (_, { userId, googleId }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (u:User {id: $userId}) SET u.googleId = $googleId RETURN u',
          { userId, googleId }
        );

        return result.records[0]?.get('u').properties;
      } finally {
        session.close();
      }
    },

    linkInstagramAccount: async (_, { userId, instagramId }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (u:User {id: $userId}) SET u.instagramId = $instagramId RETURN u',
          { userId, instagramId }
        );

        return result.records[0]?.get('u').properties;
      } finally {
        session.close();
      }
    },

    // New Profile Mutations
    updateProfile: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (u:User {id: $userId})
          SET u += $updates,
              u.lastActive = $lastActive
          RETURN u {
            .id,
            .name,
            .email,
            .role,
            .firstName,
            .lastName,
            .bio,
            .location,
            .avatarUrl,
            .joinedDate,
            .lastActive,
            .profileUrl,
            .socialLinks,
            .skills,
            .interests
          } as profile
          `,
          {
            userId: context.user.id,
            updates: {
              ...input,
              lastActive: new Date().toISOString()
            },
            lastActive: new Date().toISOString()
          }
        );

        return result.records[0].get('profile');
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      } finally {
        session.close();
      }
    },

    updateLastActive: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (u:User {id: $userId})
          SET u.lastActive = $lastActive
          RETURN u {
            .id,
            .name,
            .email,
            .role,
            .firstName,
            .lastName,
            .bio,
            .location,
            .avatarUrl,
            .joinedDate,
            .lastActive,
            .profileUrl,
            .socialLinks,
            .skills,
            .interests
          } as profile
          `,
          {
            userId: context.user.id,
            lastActive: new Date().toISOString()
          }
        );

        return result.records[0].get('profile');
      } catch (error) {
        console.error('Error updating last active:', error);
        throw error;
      } finally {
        session.close();
      }
    },
  },
};

module.exports = resolvers;