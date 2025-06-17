import mongoose,{Schema} from 'mongoose';

const speechScehma = new Schema
(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        speeches:[
            {
                by:{type:String,enum:['user','ai']},
                content:String,
            }
        ],
        pois:[
            {
                from:{type:String,enum:['user','ai']},
                message:String,
            }
        ],
    },
    {timestamps:true}
)

const Speech = mongoose.model('Speech',speechScehma);
export {Speech}