import Joi from 'joi'

export const createPostValidation=function(data){
     const schema=Joi.object({
        content:Joi.string().required(),
        mediaUrl:Joi.array().required(),
     })
     return schema.validate(data);
}



