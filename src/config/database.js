import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
    const proxyHost = process.env.NEON_PROXY_HOST || 'localhost';
    neonConfig.fetchEndpoint = `http://${proxyHost}:4444/sql`;
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
