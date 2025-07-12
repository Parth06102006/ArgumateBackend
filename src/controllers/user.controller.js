import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import axios from "axios";
import { generateOtp } from '../utils/otp.js'; 
import nodemailer from 'nodemailer'

const signup = asyncHandler(async(req,res)=>{
    console.log('start')
    const {username,email,password} = req.body;
    if([username,email,password].some(t=>t?.trim() === ''))
    {
        throw new ApiError(401,'Details not filled');
    }
    console.log(username)
    console.log(email)
    console.log(password)
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

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }
    const email_response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.EMAIL_CHECKER_API_KEY}`)
    if(email_response.data.data.status === 'invalid')
    {
        throw new ApiError(404,'Invalid EmailID')
    }
  const otp = generateOtp()

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Argumate OTP Verification</title>
      <style>
        .container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          background-color: #ffffff;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .header {
          background-color: #4b0082;
          color: #ffffff;
          padding: 15px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .content {
          padding: 20px;
          text-align: center;
        }
        .otp {
          font-size: 32px;
          font-weight: bold;
          color: #4b0082;
          margin: 20px 0;
        }
        .footer {
          font-size: 12px;
          color: #777;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body style="background-color: #f6f6f6;">
      <div class="container">
        <div class="header">Argumate</div>
        <div class="content">
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for verification is:</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          © 2025 Argumate. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;

  // Setup Zoho Nodemailer transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SEND_MAIL,
      pass: process.env.MAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `Argumate <${process.env.SEND_MAIL}>`,
    to: `${email}`,
    subject: 'Your Argumate OTP Code',
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json(
      new ApiResponse(200, 'OTP sent successfully', { otp })
    );
  } catch (error) {
    console.error('Email error:', error.message);
    throw new ApiError(500, 'Failed to send email');
  }
});

const checkSignedUp = asyncHandler(async(req,res)=>{
    console.log('start')
    const {username,email,password} = req.body;
    if([username,email,password].some(t=>t?.trim() === ''))
    {
        throw new ApiError(401,'Details not filled');
    }
    console.log(username)
    console.log(email)
    console.log(password)
    // console.log(1)
    const existingUser = await User.findOne({email : email});
    if(existingUser)
    {
        throw new ApiError(403,'User has already signed up')
    }
    return res.status(200).json(new ApiResponse(200,'User has not signed up already'))
});

export {signup,login,logout,sendOTP,checkSignedUp}