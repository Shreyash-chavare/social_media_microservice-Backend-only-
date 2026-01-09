import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
console.log("Loaded env:", process.env.IDENTITY_SERVICE_URL);
import {rateLimit} from 'express-rate-limit'
import proxy from 'express-http-proxy'
import {RedisStore} from 'rate-limit-redis';
import Redis from 'ioredis'
import cors from 'cors'
import logger from './utils/logger.js'
import helmet from 'helmet'
import errorHandler from './middleware/errorHandler.js'
import {validateToken} from './middleware/authMiddleware.js'



const app=express();
app.use(express.json());
app.use(helmet());
app.use(cors());


const client=new Redis(process.env.REDIS_URL);
const PORT=process.env.PORT;

const ratelimitopt=rateLimit({
    windowMs: 15*60*1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
         res.status(429).json({
            success:false,
            message:'Too many request...'
        })
    },
    store:new RedisStore({
        sendCommand:(...args) => client.call(...args)
    })
})

app.use(ratelimitopt);

app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
})

const proxyOption={
    proxyReqPathResolver:(req)=>{
        return req.originalUrl.replace(/^\/v1/,"/api");
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`proxy error, ${err.message}`);
        res.status(500).json({
            message:'Internal server error (api-gateway)',
            error:err.message,
        });
        //next();
    }
}

app.use("/v1/auth",
     proxy(process.env.IDENTITY_SERVICE_URL,{
      ...proxyOption,
      proxyReqOptDecorator:(proxyReqopt,srcReq)=>{
        proxyReqopt.headers["Content-Type"]="application/json";
        return proxyReqopt;
      },
      userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from Identity-service Status: ${proxyRes.statusCode}`);
        return proxyResData
      }

      
     })
);

app.use("/v1/posts",validateToken,proxy(process.env.POST_SERVICE_URL,{
    ...proxyOption,
    proxyReqOptDecorator:(proxyReqopt,srcReq)=>{
        proxyReqopt.headers["Content-Type"]="application/json";
        proxyReqopt.headers["a-user-id"]=srcReq.user.userId;
        return proxyReqopt;
     },
     userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from post-service Status: ${proxyRes.statusCode}`);
        return proxyResData
     }
}));

app.use("/v1/media",validateToken,proxy(process.env.MEDIA_SERVICE_URL,{
    ...proxyOption,
    proxyReqOptDecorator:(proxyReqopt,srcReq)=>{
        proxyReqopt.headers["a-user-id"]=srcReq.user.userId;
        if (srcReq.headers["content-type"]) {
            proxyReqopt.headers["content-type"] = srcReq.headers["content-type"];
          }
        return proxyReqopt;
     },
     userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from media-service Status: ${proxyRes.statusCode}`);
        return proxyResData
     },
     parseReqBody:false
}))

app.use("/v1/search",validateToken,proxy(process.env.SEARCH_SERVICE_URL,{
    ...proxyOption,
    proxyReqOptDecorator:(proxyReqopt,srcReq)=>{
        proxyReqopt.headers['content-type']='application/json';
        proxyReqopt.headers["a-user-id"]=srcReq.user.userId;
        return proxyReqopt;
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from search-service Status: ${proxyRes.statusCode}`);
        return proxyResData
    }
}))

app.use(errorHandler);

app.listen(PORT,()=>{
    logger.info(`API gateway is running on port : ${PORT}`);
    logger.info(`Identity-server running on : ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post-server running on : ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media-server running on : ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`search-server running on : ${process.env.SEARCH_SERVICE_URL}`);
})



