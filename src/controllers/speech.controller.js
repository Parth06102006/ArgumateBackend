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

    if(!speech)
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

const createPoiQues = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;
    const {question,roleFrom,roleTo,sender,receiver}= req.body;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }

    const roomId = existingDebate.roomId

    if([question,roleFrom,roleTo,sender,receiver].some(t=>t.trim()===''))
    {
        throw new ApiError(403,'Details are missing')
    }

    let speech = await Speech.findOne({user:userId,debate:debateId});

    if(!speech)
    {
        throw new ApiError(400,'No Speech Found')
    }

    //api to call ai to generate the poi
    if(by==='ai')
    {
        const response = await axios.post();
        
    }
    let from = {by:sender,role:roleFrom}
    let to = {by:receiver,role:roleTo}

    speech.pois.push({from,to,question})
    await speech.save()

    return res.status(200).json(new ApiResponse(200,'POI Created Successfully',speech))
})

const createPoiAns = asyncHandler(async(req,res)=>
{
    const userId = req.user;
    const debateId = req.params.id;
    const {answer,roleFrom,roleTo,sender,receiver}= req.body;

    const existingDebate = await Debate.findById(debateId);
    if(!existingDebate)
    {
        throw new ApiError(400,'No Debate exisits')
    }

    const roomId = existingDebate.roomId

    if([answer,roleFrom,roleTo,sender,receiver].some(t=>t.trim()===''))
    {
        throw new ApiError(403,'Details are missing')
    }

    let speech = await Speech.findOne({user:userId,debate:debateId});

    if(!speech)
    {
        throw new ApiError(400,'No Speech Found')
    }

    //api to call ai to generate the poi
    if(by==='ai')
    {
        const response = await axios.post();   
    }
    
    let from = {by:sender,role:roleFrom}
    let to = {by:receiver,role:roleTo}

    let poi = speech.pois.find(p=> p.from.by === sender && p.to.by === receiver && !p.answered)
    if(!poi)
    {
        throw new ApiError('No Poi Found')
    }

    poi.answer = answer
    poi.answered = true

    await speech.save()


    io.to(roomId).emit('new_poi_ans',
        {
            from,
            to,
            answer,
        });

    return res.status(200).json(new ApiResponse(200,'POI Answered Successfully',speech))
})

export {createSpeech,createPoiQues,createPoiAns};