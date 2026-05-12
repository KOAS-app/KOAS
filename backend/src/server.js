import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Guard required env vars before starting
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
