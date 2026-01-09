import mongoose from 'mongoose'
import argon2 from 'argon2'

const Userschema=new mongoose.Schema({
    username:{
        type:String,
        required: true,
        trim: true,
        unique: true
    },
    email:{
        type:String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password:{
        type:String,
        required: true
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
},
{
    timestamps:true
} 
);

Userschema.pre('save',async function(next){
          try {
            this.password=await argon2.hash(this.password);
          } catch (error) {
             return next(error);
            
          }
});

Userschema.methods.verification=async function(candid_password){
    try {
        return await argon2.verify(this.password,candid_password);
    } catch (error) {

        throw error;
        
    }
}

Userschema.index({username:'text'});

const User=mongoose.model('User',Userschema);

export default User;

