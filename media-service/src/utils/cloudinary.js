import {v2 as cloudinary} from 'cloudinary'
import logger from '../utils/logger.js'

cloudinary.config({ 
    cloud_name: 'dlfpii4sf', 
    api_key: '261427499585741', 
    api_secret: 'dwcMvuidKpUFtfq8d6Rh8a9D-EI'
});

export const uploadMediaToCloudinary=(file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream=cloudinary.uploader.upload_stream(
            {
                resource_type:"auto",
            },
            (error,result)=>{
                if(error){
                    logger.warn("Error while uploading to cloudinary");
                    reject(error);
                }
                else{
                    resolve(result);
                }
            }
        );
        uploadStream.end(file.buffer);
    })
}

export const deleteFromcloudinary=async(id)=>{
    try {
        const result=cloudinary.uploader.destroy(id);
    logger.info(`media deleted of id: ${id}`);
    return result;
    } catch (error) {
      logger.error('error while deleting media from cloudinary',error);
      throw error;  
    }
    
}