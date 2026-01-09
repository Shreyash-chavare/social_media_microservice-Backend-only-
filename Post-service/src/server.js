import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();
import redis from 'ioredis'
import helmet from 'helmet'
import logger from './utils/logger.js'
import postRoute from './routes/post.js'
import errorHandler from './middleware/errorHandler.js';
import {connectTorabbitMq} from './utils/rabbitmq.js'
import  './mongoose-connection.js';



const app=express();
const redisClient=new redis(process.env.REDIS_URL);
const port=process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(express.json());


app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
})



app.use("/api/posts",(req,res,next)=>{
    req.redisClient=redisClient;
    next();
},postRoute);

app.use(errorHandler);

async function startServer(){
    try {
        await connectTorabbitMq();
        app.listen(port,()=>{
        logger.info(`Post-Service is running at PORT : ${port}`);
        })
    } catch (error) {
        logger.error("failed to connect to post-server",error);
        process.exit(1);
    }
}
startServer();



