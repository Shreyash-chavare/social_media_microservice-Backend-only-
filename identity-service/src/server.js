import express from 'express'
import mongodbConnection from './mongoose-connection.js'

import helmet from 'helmet'
import cors from 'cors'
import logger from './utils/logger.js';
import {RateLimiterRedis} from 'rate-limiter-flexible'
import {rateLimit} from 'express-rate-limit'
import Redis from 'ioredis'
import errorHandler from './middleware/errorHandler.js';

import router from './routes/identity-server.js'

const app=express();
mongodbConnection.connect;
const redisClient=new Redis(process.env.REDIS_URL);
const PORT=process.env.PORT || 3002;

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`Received  ${req.method} request to ${req.url}`);
    logger.info(`Request body : ${req.body}`);
    next();
})

const redisLimiter=new RateLimiterRedis({
      storeClient:redisClient,
      keyPrefix:"middleware",
      points:10,
      duration:1
})

app.use((req,res,next)=>{
    redisLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
        res.status(429).json({
            success:false,
            message: 'Too many requests..'
        })
    })
})

const sensitiveEndpointsLimiter=rateLimit({
    windowMs: 15*60*100,
    max: 50,
    standardHeaders:true,
    legacyHeaders: false,
    handler:(req,res)=>{
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success:false,
            message:'Too many requests..'
        })
    }
})

app.use('/api/auth',router);

app.use('api/auth/register',sensitiveEndpointsLimiter);

app.use(errorHandler);

app.listen(PORT,()=>{
    logger.info(`identity-service running on port: ${PORT}`);
})

process.on('unhandledRejection',(reason,promise)=>{
    logger.error("unhandled Rejection at", promise,"reason",reason);
})