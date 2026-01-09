import amqp from 'amqplib'
import logger from './logger.js'

let connection=null;
let channel=null;

const EXCHANGE_NAME="social_app";

export const connectTorabbitMq=async()=>{
    try {
        connection=await amqp.connect(process.env.RABBIT_URL);
        channel=await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:false});
        logger.info("connected to rabbitMq");
        return channel;
    } catch (error) {
        logger.error("error while connecting to rabbitMq", error);
    }
}

export const publishEvent=async(routeKey,message)=>{
    if(!channel){
        await connectTorabbitMq();
    }

    channel.publish(
        EXCHANGE_NAME,
        routeKey,
        Buffer.from(JSON.stringify(message))
    )
    logger.info(`Event published, key: ${routeKey}`);
}