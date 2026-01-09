import logger from "../utils/logger.js";

export const authvalidate=async(req,res,next)=>{
     const userId=req.headers["a-user-id"];

     if(!userId){
        logger.warn("Access attempted with no userId");
        return res.status(401).json({
            success:false,
            message:"Authentication required! please login to continue",
        })
     }
     req.user={userId};
     next();
}
