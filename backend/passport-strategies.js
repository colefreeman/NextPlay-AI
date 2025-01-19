const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { driver } = require('./src/config/neo4j-driver');

const setupPassport = () => {
  console.log('Setting up Google Strategy...');
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:4000/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('Google callback received with profile:', profile.id);
        const session = driver.session();

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
          console.log('User from database:', user);

          if (!user) {
            console.error('No user returned from database');
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
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user:', id);
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
      if (!user) {
        console.log('No user found during deserialization');
        return done(null, false);
      }
      
      console.log('User found:', user);
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