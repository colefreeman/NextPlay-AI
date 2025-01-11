const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { driver } = require('./neo4j-driver');

const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:4000/auth/google/callback', // Make sure this matches exactly
      },
      async (accessToken, refreshToken, profile, done) => {
        const session = driver.session();
        console.log('Google profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails
        });

        try {
          const result = await session.run(
            `
            MERGE (u:User {googleId: $googleId})
            ON CREATE SET 
              u.id = randomUUID(),
              u.name = $name,
              u.email = $email,
              u.role = 'user',
              u.createdAt = datetime()
            WITH u
            RETURN u {.id, .name, .email, .role, .googleId} as user
            `,
            {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            }
          );

          const user = result.records[0].get('user');
          console.log('Neo4j query result:', result.records[0]);
          console.log('Created/Retrieved user:', user);

          if (!user) {
            return done(new Error('Failed to create user in database'));
          }

          return done(null, user);
        } catch (error) {
          console.error('Error in Google strategy:', error);
          return done(error);
        } finally {
          await session.close();
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $id})
        RETURN u {.id, .name, .email, .role, .googleId} as user
        `,
        { id }
      );
      
      const user = result.records[0]?.get('user');
      console.log('Deserialized user:', user);
      done(null, user);
    } catch (error) {
      console.error('Error during deserialization:', error);
      done(error);
    } finally {
      await session.close();
    }
  });
};

module.exports = setupPassport;