import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Debate } from "../models/debate.model.js";
import { Speech } from "../models/speech.model.js";
import { Notes } from "../models/notes.model.js";
import { GoogleGenAI } from "@google/genai";

const notesAnalyzer = asyncHandler(async(req,res)=>{
        const userId = req.user;
        const debateId = req.params.id;
        if(!debateId)
        {
            throw new ApiError(400,'No Debate ID Found')
        }
        const existingDebate = await Debate.findById(debateId)
        if(!existingDebate)
        {
            throw new ApiError(404,'No Debate Found')
        }
        const speech = await Speech.findOne({user:userId,debate:debateId})
        if(!speech)
        {
            throw new ApiError(400,'No Speech Found')
        }
        // Speech section
        const speechText = speech.speeches
        ?.map(s => `${s.role} (${s.by}): ${s.content}`)
        .join("\n") || "";


        // POI questions
        const poiQs = speech.pois
        ?.map(poi => `${poi.from.role} (${poi.from.by}) [POI to ${poi.to.role}]: ${poi.question}`)
        .join("\n") || "";


        // POI answers
        const poiAs = speech.pois
        ?.filter(poi => poi.answered && poi.answer)
        .map(poi => `${poi.to.role} (${poi.to.by}): ${poi.answer}`)
        .join("\n") || "";


        // Final formatted transcript
        const fullTranscript = `${speechText}\n${poiQs}\n${poiAs}`;
        console.log(fullTranscript)

        const message = `
            You are a debate analyst. Parse the following transcript and extract structured notes for **each speaker**.

            Expected output format:
            [
            {
                "speaker": "string",
                "role": "string",
                "statements": [
                { "type": "Claim | Rebuttal | POI | Emotion | Summary", "content": "string" }
                ]
            }
            ]

            Transcript:
            ${fullTranscript}`;
          const responseSchema = {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                    "speaker": {
                        "type": "string",
                        "description": "The full name or identifier of the speaker (e.g., 'Government Whip (AI)', 'Leader of Opposition')"
                    },
                    "role": {
                        "type": "string",
                        "description": "The specific debate role assigned to the speaker (e.g., 'Opening Government', 'Opposition Whip')"
                    },
                    "statements": {
                        "type": "array",
                        "items": {
                        "type": "object",
                        "properties": {
                            "type": {
                            "type": "string",
                            "enum": ["Claim", "Rebuttal", "POI", "Emotion", "Summary"],
                            "description": "Type of content being expressed in the statement"
                            },
                            "content": {
                            "type": "string",
                            "description": "The actual text of the argument, point, or emotion"
                            }
                        },
                        "required": ["type", "content"]
                        }
                    }
                    },
                    "required": ["speaker", "role", "statements"]
                }
                }

                try {
                const client = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY_2});
                const response = await client.models.generateContent({
                        model:'gemini-2.5-flash',
                        contents:message,
                        config:{
                            responseMimeType:'application/json',
                            responseSchema:responseSchema
                        }
                    })
        console.log(response.text)
        const jsonData = JSON.parse(response.text)
        let notes = await Notes.findOne({user:userId,debate:debateId})
        if(!notes)
            {
                notes = await Notes.create({user:userId,debate:debateId,notes:jsonData})
            }
        else
            {
                notes = await Notes.findByIdAndUpdate(notes._id,{notes:jsonData},{new:true})
            } 
        return res.status(200).json(new ApiResponse(200,'Notes Created Successfully',{Notes:notes.notes}))
    } catch (error) {
        console.error(error.message)
        throw new ApiError(500,'Cannot Generate Notes')
    }
})


export {notesAnalyzer}
