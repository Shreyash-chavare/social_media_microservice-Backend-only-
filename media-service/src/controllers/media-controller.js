import Media from '../models/media.js'
import {uploadMediaToCloudinary} from '../utils/cloudinary.js'
import logger from '../utils/logger.js'

export const uploadMedia=async(req,res)=>{
    logger.info("uploadMedia endpoint hit...");
    try {
        if(!req.file){
            logger.error("No file found. pls add a file and try again");
            return res.status(400).json({
                message:"No file detected!",
                success:false
            })
        }

        const {originalname,mimetype,buffer}=req.file;
        const userid=req.user.userId;

        logger.info(`file name: ${originalname} , fileType: ${mimetype}`);
        logger.info("starting uploading to cloadinary...");

        const uploadToCloudinary=await uploadMediaToCloudinary(req.file);
        logger.info(`Uploaded to cloudinary successfull. public Id-${uploadToCloudinary.public_id}`);

        const newMedia=new Media({
            publicId:uploadToCloudinary.public_id,
            originalName:originalname,
            mimeType:mimetype,
            Url:uploadToCloudinary.secure_url,
            userId:userid
        })
        await newMedia.save();

        res.status(201).json({
            mediaId: newMedia._id,
            Url:uploadToCloudinary.secure_url,
            success:true,
            message:"File uploaded successfully"
        })   
    } catch (error) {
        logger.error("Error in creating media!",error);
        return res.status(500).json({
            success:false,
            message:"Error in creating  media"
        })
    }
}
