import express from 'express'
import { Server } from 'socket.io'
import { dbConnect } from './db/db.js';
import {createServer} from 'http'
import userRouter from './routes/user.route.js'
import { errorHandling } from './middlewares/error.middleware.js';
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';

dotenv.config(
    {path:'./.env'}
)
const app = express();
const server = createServer(app)
const PORT = process.env.PORT || 3000
const io = new Server(server);

io.on('connection',(socket)=>{
    console.log('a user connected');

    socket.on('join_room',(roomId)=>
        {
            socket.join(roomId,()=>
            {
                console.log('user joined the room',roomId)
            })
        })

    socket.on('disconnect',()=>
    {
        console.log('user disconnected')
    })
})
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use('/api/v1',userRouter);
app.use(errorHandling)

export {io}

dbConnect()
.then(()=>{
    server.listen(PORT,()=>{console.log(`Server is listening at the ${PORT}`)})
})
.catch(()=>{
    console.log('Something went wrong')
})
