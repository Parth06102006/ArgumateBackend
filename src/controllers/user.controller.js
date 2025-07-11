import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import axios from "axios";

const signup = asyncHandler(async(req,res)=>{
    console.log('start')
    const {username,email,password} = req.body;
    if([username,email,password].some(t=>t?.trim() === ''))
    {
        throw new ApiError(401,'Details not filled');
    }
    // console.log(1)
    const existingUser = await User.findOne({email : email});
    if(existingUser)
    {
        throw new ApiError(403,'User has already signed up')
    }
    const email_response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.EMAIL_CHECKER_API_KEY}`)
    if(email_response.data.data.status === 'invalid')
    {
        throw new ApiError(404,'Invalid EmailID')
    }

    //hash the password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password,salt)
    // console.log(3)

    try {
        const newUser = (await User.create({username,email,password:hashedPassword}));
        if(!newUser)
        {
            throw new ApiError(500,'User cannot be signed up')
        }
        return res.status(201).json(new ApiResponse(201,'User signed up successfully',{username:newUser.username , email:newUser.email}))
    } catch (error) {
        console.error(error)
        console.log('here')
        throw new ApiError(500,'Something went wrong try again later')
    }
})

const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    console.log(email)
    console.log(password)
    if(!email||!password)
    {
        throw new ApiError(401,'Details not filled');
    }
    
    const existingUser = await User.findOne({email});
    if(!existingUser)
    {
        throw new ApiError(403,'User has not signed up')
    }

    //compare the password
    const isPasswordValid = await existingUser.isPasswordCorrect(password)
    if(!isPasswordValid)
    {
        throw new ApiError(403,'Incorrect Password')
    }

    //generate the token
    const token = existingUser.generateToken();
    const isProd = process.env.NODE_ENV === 'production'
    const options = 
    {
        httpOnly:true,
        secure:isProd,
        sameSite:isProd ? 'none':'lax',
        expires: new Date(Date.now() + 3*24*60*60*100)
    }
    console.log(token)
    return res.status(200).cookie('token',token,options).json(new ApiResponse(200,'User Logged in Successfully'))
})

const logout = asyncHandler(async(req,res)=>{
    const userId = req.user;
    const options = {
        httpOnly:true
    }
    return res.status(200).clearCookie('token',options).json(new ApiResponse(200,'User logged out Successfully',{}))
})

export {signup,login,logout}