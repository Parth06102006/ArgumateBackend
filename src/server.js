import express, { urlencoded } from 'express'
import { Server } from 'socket.io'
import { dbConnect } from './db/db.js';
import {createServer} from 'http'
import userRouter from './routes/user.route.js'
import debateRouter from './routes/debate.route.js'
import speechRouter from './routes/speech.route.js'
import scoreRouter from './routes/score.route.js'
import notesRouter from './routes/notes.route.js'
import sentmentRouter from './routes/sentiment.route.js'
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
const io = new Server(server,
    {
        cors:{
        origin:`${process.env.FRONTEND_URL}`,
        credentials:true

    }
}
);

io.on('connection',(socket)=>{
    console.log('a user connected');

    socket.on('join_room',(roomId)=>
        {
            console.log('this function has initiated')
            socket.join(roomId)
            console.log('user joined the room',roomId)
        })

    socket.on('disconnect',()=>
    {
        console.log('user disconnected')
    })
})
app.use(express.json())
app.use(cors({origin:`${process.env.FRONTEND_URL}`,
    secure:false,
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/api/v1',userRouter);
app.use('/api/v1',debateRouter);
app.use('/api/v1',speechRouter);
app.use('/api/v1',scoreRouter);
app.use('/api/v1',notesRouter);
app.use('/api/v1',sentmentRouter);
app.use(errorHandling)
export {io}

dbConnect()
.then(()=>{
     server.listen(PORT,()=>{console.log(`Server is listening at the ${PORT}`)})
})
.catch(()=>{
    console.log('Something went wrong')
})
