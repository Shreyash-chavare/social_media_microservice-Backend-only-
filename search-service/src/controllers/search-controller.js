import Search from "../models/search.js";
import logger from "../utils/logger.js";


export const searchPost=async(req,res)=>{
    logger.info("searchPost endpoint hit...");
    try {
        const {query}=req.query;
        const getPost=await Search.find(
        {
          $text:{$search:query}
        },
        {
            score:{$meta:"textScore"}
        }
        ).sort({score:{$meta:"textScore"}}).limit(10);


        res.json(getPost);
    } catch (error) {
        logger.error("error while searching post",error);
        return res.status(500).json({
            message:error.message,
            success:false
        })
    }
}