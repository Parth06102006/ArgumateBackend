import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
        username:
        {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        password:
        {
            type:String,
            required:[true,"password is required"]
        },
    },
    {timestamps:true}
)

userSchema.methods.isPasswordCorrect = async function(password)
{
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function(){
    return jwt.sign({_id:this._id,email: this.email, username: this.username},process.env.TOKEN_SECRET,{expiresIn:process.env.TOKEN_EXPIRY})
}

export const User = mongoose.model('User',userSchema)
