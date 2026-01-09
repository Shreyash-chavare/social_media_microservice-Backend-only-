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

export const consumeEvent=async(routeKey,callback)=>{
    if(!channel){
        await connectTorabbitMq();
    }

    const q=await channel.assertQueue("",{exclusive:true});
     await channel.bindQueue(q.queue,EXCHANGE_NAME,routeKey);
     channel.consume(q.queue,(msg)=>{
        if(msg){
            const content=JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
     });
     logger.info(`subscribed to event : ${routeKey}`)

}