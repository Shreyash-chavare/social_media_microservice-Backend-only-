import logger from "../utils/logger.js";
import Search from '../models/search.js'

export const createdPost=async(event)=>{
    try {

        const putPost=new Search(
            {
              postId:event.postId,
              userId:event.userId,
              content:event.content,
              createdAt:event.createdAt
            }
           )
    
           await putPost.save();
           logger.info(`search post of ${event.postId} created : ${putPost._id} `)
        
    } catch (error) {
        logger.error(error, "Error handling post creation event");
        
    }
       
}

export const deletePost=async(event)=>{
    try {
        const delPost=await Search.findOneAndDelete({postId:event.postId});
        logger.info(`post :${delPost._id} deleted search bd of ${event.postId}  `)
    } catch (error) {
        logger.error(error, "Error handling post deletion  event");
    }
}