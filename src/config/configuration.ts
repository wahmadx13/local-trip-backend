import { APP_NAME_FALLBACK } from '../utils/constants';
import { splitCsv } from '../utils/helpers';

export default () => ({
  app: {
    name: process.env.APP_NAME || APP_NAME_FALLBACK,
    env: process.env.APP_ENV!,
  },
  port: parseInt(process.env.PORT!, 10),
  cors: {
    origins: splitCsv(process.env.CORS_ORIGIN!),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n',
    ),
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },
});
