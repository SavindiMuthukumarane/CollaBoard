import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDatabase();
  app.listen(port, '0.0.0.0', () => console.log(`CollabBoard API running on port ${port}`));
}

start().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
