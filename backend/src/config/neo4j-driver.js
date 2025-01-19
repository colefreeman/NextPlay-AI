const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionTimeout: 20000,
    maxTransactionRetryTime: 30000
  }
);

// Verify connection
const verifyConnection = async () => {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('Successfully connected to Neo4j');
  } catch (error) {
    console.error('Neo4j connection error:', error.message);
    // Don't throw the error, just log it
  } finally {
    await session.close();
  }
};

// Call verify connection when the driver is initialized
verifyConnection().catch(console.error);

module.exports = { driver };