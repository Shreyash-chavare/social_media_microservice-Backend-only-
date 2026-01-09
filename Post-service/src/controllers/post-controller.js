import Post from "../models/post.js";
import logger from "../utils/logger.js";
import { createPostValidation } from "../utils/validation.js";
import {publishEvent} from '../utils/rabbitmq.js'



 const invalidateCache =async(req,input)=>{
    if(input){
      const cacheKey=`post:${input}`
      await req.redisClient.del(cacheKey);
      return;
    }
    const keys=await req.redisClient.keys('post:*');
    if(keys.length>0){
      await req.redisClient.del(keys);
    }

}

export const createPost= async(req,res)=>{
      logger.info("create post endpoint hit...")
      try {
         
        const {error}=createPostValidation(req.body);
        if(error){
          logger.error("Content field is missing...");
          return res.status(401).json({
            success:false,
            message:"Content is required!"
          })
        }

        

        await invalidateCache(req);

        const {content,mediaUrl}=req.body;

        const newPost=await Post.create({
            user:req.user.userId,
            content,
            mediaUrl: mediaUrl || []
        })
        await newPost.save();
         
        await publishEvent(
          'post.created',{
            postId:newPost._id.toString(),
            userId:req.user.userId.toString(),
            content:newPost.content,
            createdAt:newPost.createdAt
          }
        )
       

        logger.info("New post created successfully");
        res.status(201).json({
            success: true,
            message:"Post created..."
        })
        
      } catch (error) {
        logger.error("Create post failed", error);

        return res.status(500).json({
          success: false,
          message: "Post creation failed"
        });
      }
};

export const getAllPost= async(req,res)=>{
    logger.info("getAllpost endpoint hit...");
    try {
        const page=parseInt(req.query.page) || 1;
        const limit=parseInt(req.query.limit) ||10;
        const startIndex=(page-1)*limit;

        const cachekey=`post:${page}:${limit}`;
        const cachedPosts=await req.redisClient.get(cachekey);
        if(cachedPosts){
          return res.json(JSON.parse(cachedPosts));
        }
        const posts=await Post.find({}).sort({createdAt:-1}).skip(startIndex).limit(limit);
        const totalposts=await Post.countDocuments();
        const result={
          posts,
          totalpage:Math.ceil(totalposts/limit),
          totalposts: totalposts
        };

        await req.redisClient.setex(cachekey,120,JSON.stringify(result));

        res.json(result);
      
    } catch (error) {

      logger.error("fetching allPost failed", error);

        return res.status(500).json({
          success: false,
          message: "Posts fetching failed!"
        });
      
    }
};


export const getPost= async(req,res)=>{
    logger.info('Getpost endpoint hit...');
    try {
      const pageid=req.params.id;
      const userPost=await Post.findById(pageid);
      if(!userPost){
        logger.error(`No such post with Id: ${pageid}`);
        return res.status(500).json({
          success:false,
          message:"No such post exist"
        });
      }
      const cachekey=`post:${pageid}`;
      const fetchCachePost=await req.redisClient.get(cachekey);
      if(fetchCachePost){
         return res.json(JSON.parse(fetchCachePost));
      }

      await req.redisClient.setex(cachekey,60,JSON.stringify(userPost));

      return res.json(userPost);

      
    } catch (error) {
      
    }
};

export const deletePost= async(req,res)=>{
     logger.info("DeletePost endpoint hit...");
    try {
      const pageId=req.params.id;
      const post=await Post.findOneAndDelete({_id:pageId,user:req.user.userId});

      await publishEvent(
        "post.deleted",{
          postId:pageId,
          userId:req.user.userId,
          mediaIds:post.mediaUrl
        }
      )

      await invalidateCache(req,pageId);

       res.json({
        success:true,
        message:`Post Id deleted :${pageId}`
      })
      
    } catch (error) {
      logger.error("deleting a post failed", error);

        return res.status(500).json({
          success: false,
          message: "Post delete failed!"
        });
    }
};