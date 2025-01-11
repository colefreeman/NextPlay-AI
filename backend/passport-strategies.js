const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { driver } = require('./neo4j-driver');

const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
      },
      async (accessToken, refreshToken, profile, done) => {
        const session = driver.session();
        try {
          // Find or create user in the database
          const result = await session.run(
            `
            MERGE (u:User {googleId: $googleId})
            ON CREATE SET u.id = randomUUID(), u.name = $name, u.email = $email
            ON MATCH SET u.id = coalesce(u.id, randomUUID())
            RETURN u {.*}
            `,
            {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0]?.value,
            }
          );

          const user = result.records[0]?.get('u').properties;
          console.log('User from Neo4j:', user); // Debugging
          return done(null, user);
        } catch (error) {
          return done(error);
        } finally {
          session.close();
        }
      }
    )
  );

  // Serialize user into session
  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user); // Debugging
    done(null, user.id); // Store only the user ID in the session
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user with ID:', id); // Debugging
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (u:User {id: $id}) RETURN u',
        { id }
      );
      const user = result.records[0]?.get('u').properties;
      console.log('User retrieved from Neo4j:', user); // Debugging
      done(null, user);
    } catch (error) {
      done(error);
    } finally {
      session.close();
    }
  });
};

module.exports = setupPassport;