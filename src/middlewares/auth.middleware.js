import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

const authHandling = asyncHandler(async(req,res,next)=>
{
    const token = req.cookies.token || req.header('Authorization').replace('Bearer ','') || req.body.token;

    if(!token)
    {
        throw new ApiError(403,'Token not present');
    }

    const decodedToken = jwt.verify(token,process.env.TOKEN_SECRET);
    if(!decodedToken)
    {
        throw new ApiError(403,'Invalid Token')
    }

    const user = await User.findById(decodedToken._id).select('-password');
    if(!user)
    {
        throw new ApiError(403,'No User Found')
    }

    res.user = user._id;
    next()
})

export {authHandling}