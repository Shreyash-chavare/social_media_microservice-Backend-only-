import mongoose from 'mongoose'
import logger from './utils/logger.js'
import dotenv from 'dotenv'
dotenv.config();

const mongodbConnection=mongoose.connect(process.env.MONGO_URI)
.then(()=>logger.info("connected to mongoDb"))
.catch((e)=> logger.error("MongoDb connection error",e));


export default mongodbConnection;
