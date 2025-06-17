import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {Debate} from "../models/debate.model.js";
import { roleGenerator } from "../utils/roleGenerated.js";
import jwt from 'jsonwebtoken'

const debateCreation = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    console.log(userId)
    console.log(1)
    const {topic,format,level,role} = req.body;
    if([topic,format,level,role].some(t=>t?.trim() === ''))
    {
        throw new ApiError(400,'Enter all the details');
    }
    console.log(2)
    const roles = roleGenerator(format,role);
    console.log(3)
    try {
        const newDebate = await Debate.create({user:userId,topic,format,level,roles});

        if(!newDebate)
        {
            throw new ApiError(400,'Error creating new Debate');
        }

        let roomId = newDebate._id.toString().slice(0,5);
        newDebate.roomId = roomId;
        await newDebate.save();
        
        return res.status(200).json(new ApiResponse(200,'New Debate Initiated',{debate:newDebate}));

    } catch (error) {
        console.error(error);
        throw new ApiError(500,'Error Starting a new Debate');
    }
})

export {debateCreation}