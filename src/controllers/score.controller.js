import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Debate} from "../models/debate.model.js";
import {Speech} from "../models/speech.model.js"
import { io } from "../server.js";
import axios from "axios";

const scoreCalculate = asyncHandler(async(req,res)=>
    {
/*         const userId = req.user;
        const debateId = req.params.id;

        //api call for the score
        const response = await axios.post()

        const score = response.data.score; */
    }
)