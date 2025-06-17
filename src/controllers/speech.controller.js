import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Debate} from "../models/debate.model.js";
import {Speech} from "../models/speech.model.js"
import { io } from "../server.js";
import axios from "axios";

const createSpeech = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;
    const {content,role,by} = req.body;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }

    const roomId = existingDebate.roomId

    if(!role||!by)
    {
        throw new ApiError(403,'Details are missing')
    }

    let speech = await Speech.findOne({user:userId,debate:debateId});

    //api to call ai to generate the speech
    if(by==='ai')
    {
        const response = await axios.post();
        
    }

    if(!existingSpeech)
    {
        speech = await Speech.create({user:userId,debate:debateId,speeches:[by,role,content]})
    }
    else
    {
        speech.speeches.push({by,role,content});
        await existingSpeech.save()
    }

    io.to(roomId).emit('new_speech',
        {
            by,
            role,
            content
        });

    return res.status(200).json(new ApiResponse(200,'Speech Created Successfully',speech))
})
