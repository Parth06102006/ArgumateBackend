import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

const authHandling = asyncHandler(async(req,res,next)=>
{
    const token = req.cookies.token || req.body.token ||  req?.header('Authorization')?.replace('Bearer','');
    console.log(token)
    if(!token)
    {
        throw new ApiError(403,'Token not present');
    }
    console.log(1)
    console.log(token)
    const decodedToken = jwt.verify(token,process.env.TOKEN_SECRET);
    if(!decodedToken)
    {
        throw new ApiError(403,'Invalid Token')
    }
    console.log(2)
    const user = await User.findById(decodedToken._id).select('-password');
    if(!user)
    {
        throw new ApiError(403,'No User Found')
    }

    req.user = user._id;
    next()
})

export {authHandling}