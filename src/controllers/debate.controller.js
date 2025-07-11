import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Debate} from "../models/debate.model.js";
import { roleGenerator } from "../utils/roleGenerated.js";
import cuid from 'cuid'

const debateCreation = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    console.log(userId)
    console.log(1)
    const {topic,format,level,role} = req.body;
    console.log(format)
    console.log(role)
    if([topic,format,level,role].some(t=>t?.trim() === ''))
    {
        throw new ApiError(400,'Enter all the details');
    }
    console.log(2)
    const cleanedRole = role.replace(/\s*\([^)]*\)/g, '');

    const roles = roleGenerator(format,cleanedRole);
    console.log(roles)
    console.log(3)
    try {
        const roomId = cuid()
        const newDebate = await Debate.create({user:userId,topic,format,level,roles,roomId});
        console.log(4)
        if(!newDebate)
        {
            throw new ApiError(400,'Error creating new Debate');
        }
        console.log(newDebate)
        await newDebate.save();
        
        return res.status(200).json(new ApiResponse(200,'New Debate Initiated',{debate:newDebate}));

    } catch (error) {
        console.error(error);
        throw new ApiError(500,'Error Starting a new Debate');
    }
})

const restartDebate = asyncHandler(async(req,res)=>{
    const userId = req.user;
    console.log(userId)
    console.log(1)
    const {topic} = req.body;
    if(!topic)
    {
        throw new ApiError(400,'Enter the Topic');
    }
    try {
        const existingDebate = await Debate.findOne({user:userId,topic});
        if(!existingDebate)
        {
            throw new ApiError(400,`Error finding the Debate with topic:${topic}`);
        }
        
        return res.status(200).json(new ApiResponse(200,'Debate Restarted',{debate:existingDebate}));

    } catch (error) {
        console.error(error);
        throw new ApiError(500,'Error Starting a new Debate');
    }
})

const getDebateTopics = asyncHandler(async (req, res) => {
    const userId = req.user;

    const existingDebates = await Debate.find({ user: userId });

    if (!existingDebates.length) {
        throw new ApiError(400, 'No Existing Debate found');
    };

    return res.status(200).json({
        success: true,
        message: 'Successfully fetched the debate topics for the user',
        topics:existingDebates,
    });
});


export {debateCreation,restartDebate,getDebateTopics}