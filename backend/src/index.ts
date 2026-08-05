import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './infrastructure/config/env';
import { swaggerSpec } from './infrastructure/config/swagger';
import { authenticate } from './presentation/middlewares/auth';
import { apiLimiter } from './presentation/middlewares/ratelimiter';
import routes from './presentation/routes';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
    'https://kanggo-fe.awanbox.biz.id',
    'http://localhost:3000',
];

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(apiLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'Server Online', timestamp: new Date() });
});

app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api', (req, res, next) => {
    const publicPaths = ['/auth/register', '/auth/login'];
    if (publicPaths.includes(req.path)) {
        return next();
    }
    authenticate(req, res, next);
}, routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});