import User from '../models/user.js';
import logger from '../utils/logger.js'
import generateToken from '../utils/generateToken.js';
import {registrationValidation,loginValidation} from '../utils/validation.js'

//---- Registration part ----

export const Registration=async function(req,res){
    logger.info('Registration endpoint hit...')

    try {

      const {error}=registrationValidation(req.body);

      if(error){
        logger.warn("Validation error",error.details[0].message);
        return res.status(400).json({
            success:false,
            message: error.details[0].message
        })
      }

      const {username,email,password}=req.body;

      let user=await User.findOne({$or:[{email},{username}]});

      if(user){
        logger.warn("User already exist..");
        return res.status(400).json({
            success: false,
            message: "user already exist.."
        })
      }

      user=await User({username,email,password});

      await user.save();

      logger.warn("Registration completed", user._id);

      const {accessToken,referenceToken} =await generateToken(user);
      res.status(201).json({
        success: true,
        message: "user registration success",
        accessToken,
        referenceToken
      })
        
    } catch (error) {
        logger.error("user registration error", error);
    }
}


export const Login=async function(req,res){
      logger.info("Login endpoint hit...");
      try {
        const {error}=loginValidation(req.body);
        if(error){
          logger.warn("Login validation error",error.details[0].message);
          return res.status(400).json({
            success:false,
            message:error.details[0].message,
          })
        }
        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(!user){
          logger.warn("invalid user...");
          return res.status(400).json({
            success:false,
            message:"User not exist...",
          })
        }

        const validatePassword=await user.verification(password);

        if(!validatePassword){
          logger.warn("Incorrect password..","Incorrect password");
          return res.status(400).json({
            success:false,
            message:"Incorrect password",
          })
        }

      const {accessToken,referenceToken} =await generateToken(user);
      res.status(201).json({
        success: true,
        message: "Login success",
        accessToken,
        referenceToken,
        userId:user._id,
      })

        
      } catch (error) {
        logger.error("user login error", error);
      }
}

