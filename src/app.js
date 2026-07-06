import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auht.routes.js';
import usersRoutes from './routes/users.routes.js';
import securityMiddleware from './middleware/security.middleware.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(securityMiddleware);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);

app.get('/', (req, res) => {
  logger.info('hello from acquisitions!!');
  res.status(200).send('hello from Acquisitions');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'acqisitions api is running..' });
});

app.use('/api/auth', authRoutes); //api route
app.use('/api/users', usersRoutes);

export default app;
