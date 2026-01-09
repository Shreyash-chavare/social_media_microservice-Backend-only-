import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Token from '../models/token.js'

const generateToken=async(user)=>{
    const accessToken=jwt.sign({
        userId:user._id,
        username:user.username
    },process.env.JWT_SECRET,{expiresIn:'60m'})

    const referenceToken=crypto.randomBytes(40).toString('hex')
     const expireAt= new Date();
     expireAt.setDate(expireAt.getDate() + 3);

     await Token.create({
        token: referenceToken,
        user: user._id,
        expireAt
     })

     return {accessToken,referenceToken};
}
export default generateToken;