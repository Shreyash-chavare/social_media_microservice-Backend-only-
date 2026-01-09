import logger from "../utils/logger.js";
import { deleteFromcloudinary } from "../utils/cloudinary.js";
import Media from '../models/media.js'
export const deleteResponse=async(event)=>{
    const {postId,mediaIds}=event;
    try {
        const mediaPost=await Media.find({_id:{$in:mediaIds}})

        for(const media of mediaPost){
            await deleteFromcloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(`deleted media ${media._id} associated with post : ${postId}`);
        }

        logger.info(`processed delete media for postid : ${postId} `)
        
        
    } catch (error) {
        logger.error('event error',error);
    }
}