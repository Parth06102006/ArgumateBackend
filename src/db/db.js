import mongoose from 'mongoose'

export const dbConnect = async ()=>
{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log('Database connected successfully')
    } catch (error) {
        console.error(error)
        console.log('Database not connected')
        process.exit(1)
    }
}