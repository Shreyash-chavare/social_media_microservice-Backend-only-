import './mongoose-connection.js'
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express'
import helmet from 'helmet'
import mediaRoute from './routes/media.js'
import logger from './utils/logger.js';
import { connectTorabbitMq, consumeEvent } from './utils/rabbitmq.js';
import {deleteResponse} from './events/consumer.js'


const app=express();
const port=process.env.PORT

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/media',mediaRoute);



async function startServer(){
    try {
        await connectTorabbitMq();
        await consumeEvent('post.deleted',deleteResponse)
        app.listen(port,()=>{
            logger.info(`media server running on port :${port}`);
        })
    } catch (error) {
        logger.error("failed to connect to media-server",error);
        process.exit(1);
    }
}
startServer();

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });