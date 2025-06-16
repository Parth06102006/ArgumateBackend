import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandling = async(err,req,res,next)=>
{
    let error = err;
    console.log(err)
    if(!(error instanceof ApiError))
    {
        console.log('started')
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || 'Something went wrong'
        error = new ApiError(statusCode,message,err?.errors || [] , err.stack);
    }

    const response  = 
    {
        ...error,
        message : error.message,
    }

    return res.status(error.statusCode).json(response)
}

export {errorHandling}