import express from 'express'
import cors from 'cors';
import helmet from 'helmet'
import dotenv from 'dotenv';
dotenv.config();
import redis from 'ioredis'
import './mongoose-connection.js'
import logger from './utils/logger.js';
import searchRoute from './routes/search-Route.js'
import {createdPost,deletePost} from './events/consume.js';
import {connectTorabbitMq,consumeEvent} from './utils/rabbitmq.js'



const app=express();
const redisClient=new redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`Received ${req.method} method to url ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
})

app.use('/api/search',async(req,res,next)=>{
    req.redisClient=redisClient;
    next();
},searchRoute);
const PORT=process.env.PORT;

const startServer=async()=>{
    try {
        app.listen(PORT,()=>{
            logger.info(`Search server is running at post ${PORT}`);
        })
        connectTorabbitMq().then(()=>{
            consumeEvent('post.created',createdPost);
         consumeEvent('post.deleted',deletePost);
        }).catch(err=>logger.error(err));
        
        
        

        
    } catch (error) {
        logger.error('failed to connect search-server',error);
        process.exit(1);
    }
}
startServer();