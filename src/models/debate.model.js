import mongoose, {Schema} from "mongoose";

const debateSchema = new Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        roomId:{
            type:String,
            unique:true,
            trim:true,
        },
        topic:{
            type:String,
            lowercase:true,
            trim:true,
            required:true
        },
        format:{
            type:String,
            enum:['Asian','British'],
            required :true
        },
        level:{
            type:String,
            enum:['Beginner','Intermediate','Advanced']
        },
        role:
        {
            type:String,
            required:true
        },
    },
    {timestamps:true}
)

const Debate = mongoose.model('Debate',debateSchema);
export {Debate}
