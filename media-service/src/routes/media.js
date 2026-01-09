import express from 'express'
import multer from 'multer'
import {authvalidate} from '../middleware/authentication.js'
import { uploadMedia } from '../controllers/media-controller.js';
import logger from '../utils/logger.js';

const router=express.Router();

router.use(authvalidate);

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:5*1024*1024
    }
}).single("file")


router.post('/upload',(req,res,next)=>{
    upload(req,res,(error)=>{
        if(error  instanceof multer.MulterError){
            logger.error("multer error while uploading!");
            return res.status(501).json({
                message:"multer error while uploading!",
                error:error.message,
                stack:error.stack
            });
        }
        else if(error){
            logger.error("unknown error while uploading!");
            return res.status(501).json({
                message:"unknow error while uploading!",
                error:error.message,
                stack:error.stack
            });
        }

        if(!req.file){
            logger.error("file not found!");
            return res.status(501).json({
                message:"File not found!",
                error:error.message,
                stack:error.stack
            });

        }
        next();
    })
    
},uploadMedia);

export default router;