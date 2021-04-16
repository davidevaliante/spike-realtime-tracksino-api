import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import crazyTimeApi from './api/crazy-time'
import { createServer } from "http"
import { Server, Socket } from "socket.io"
import cors from 'cors'
import cron from 'node-cron'
import bodyParser from 'body-parser'
import { SpinModel } from './mongoose-models/crazy-time/Spin'

dotenv.config()

const app = express()

const PORT = process.env.PORT


app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api', crazyTimeApi)


app.listen(PORT, async () => {    
    console.log(`> Realtime API running on port ${PORT}`)
    try {
        mongoose.connect(process.env.MONGO_CONNECTION_STRING, {useNewUrlParser:true, useUnifiedTopology:true})
        const mongoDb = mongoose.connection
        mongoDb.on('error', console.error.bind(console, 'database connection error'))
        mongoDb.once('open', () => console.log('connected to Mongo DB'))

        SpinModel.watch().on('change', change => {
            console.log(change)
        })
    } catch (error) {
        console.error(error)
    }
})

const httpServer = createServer(app)

let clientsCount = 0

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket: Socket) => {
    clientsCount++
    console.log(`${clientsCount} clients connected`)

    console.log(`${socket.id} is in rooms -> ${[...socket.rooms.values()]}`)

    socket.emit('crazy-time-join')

    socket.emit('event', 'hello')

    socket.on('crazy-time-join', (data, callback) => {
        console.log(data)
        socket.join('crazy-time')
        socket.leave(socket.id)
        console.log(`${socket.id} is in rooms -> ${[...socket.rooms.values()]}`)
    })

    socket.on('disconnect', (reason : string) =>{
        clientsCount--
        console.log(`${clientsCount} clients connected`)
    })

    socket.on('message', (data) => {
        console.log(data)
    })
})

cron.schedule('*/5 * * * * *', () => {
    io.to('crazy-time').emit('update',{
        hello : 'from crazy time api'
    })
})


httpServer.listen(process.env.SOCKET_PORT, () =>{
    console.log(`> Socket initialized on port ${process.env.SOCKET_PORT}`)
})