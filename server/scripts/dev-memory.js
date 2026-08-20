// Convenience runner for local development/demo: boots the real server against an
// ephemeral in-memory MongoDB instead of requiring a local/Atlas MongoDB install.
// Data is lost when the process exits. For production, use `npm start` with a real MONGODB_URI.
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-production';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  process.env.PORT = process.env.PORT || '4000';
  console.log(`[dev-memory] In-memory MongoDB ready at ${mongod.getUri()}`);
  require('../src/index.js');
}

main();
