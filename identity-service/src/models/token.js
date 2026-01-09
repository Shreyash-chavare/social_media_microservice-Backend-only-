import mongoose from 'mongoose'
import User from './user.js'

const refreshToken=new mongoose.Schema({
    token:{
        type:String,
        required: true,
        unique: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    expireAt:{
        type: Date,
        required: true,
    }
},
{
    timestamps: true
});

refreshToken.index({expireAt:1},{expireAfterSeconds:0});

const Token=mongoose.model('Token',refreshToken);

export default Token;