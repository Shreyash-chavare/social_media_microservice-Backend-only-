import Joi from 'joi'

export const registrationValidation=function(data){
     const schema=Joi.object({
        username:Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required()
     })
     return schema.validate(data);
}

export const loginValidation=function(data){
   const schema=Joi.object({
      email:Joi.string().email().required(),
      password:Joi.string().min(3).required(),
   })
   return schema.validate(data);
}

