import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import crazyTimeApi from './api/crazy-time'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import cors from 'cors'
import cron from 'node-cron'
import { getLatestSpins, getStatsInTheLastHours } from './api/get'
import { TimeFrame, timeFrameValueToHours } from './models/TimeFrame'
import osu from 'node-os-utils'

dotenv.config()
const cpu = osu.cpu

// cron.schedule('*/1 * * * * *', async () => {
// 	cpu.usage().then(info => {
// 		console.log(info)
// 	})
// })

const app = express()

const PORT = process.env.PORT

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', crazyTimeApi)

const httpServer = createServer(app)

let clientsCount = 0

const io = new Server(httpServer, {
	cors: {
		origin: [
			'http://localhost:3000',
			'https://spikemultilanguage.toply.info',
			'https://www.spikeslot.com',
			'https://spikeslot.com',
			'https://spikeslotgratis.com',
			'https://www.spikeslotgratis.com',
		],
		methods: ['GET', 'POST'],
	},
})

io.on('connection', (socket: Socket) => {
	let currentRoom = socket.id
	clientsCount++
	console.log(`${clientsCount} clients connected`)

	Object.values(TimeFrame).forEach(tf => {
		socket.on(tf, data => {
			console.log(`${socket.id} joining ${tf} and leaving ${currentRoom}`)
			socket.join(tf)
			socket.leave(currentRoom)
			currentRoom = tf
		})
	})

	socket.on('disconnect', (reason: string) => {
		clientsCount--
		console.log(`${clientsCount} clients connected`)
	})

	socket.on('message', data => {
		console.log(data, `from ${socket.id}`)
	})
})

Object.values(TimeFrame).forEach(tf => {
	// cron.schedule('*/5 * * * * *', async () => {
	// 	const spins = await getLatestSpins(25)
	// 	const stats = await getStatsInTheLastHours(timeFrameValueToHours(tf))
	// 	io.to(tf).emit(tf, {
	// 		timeFrame: tf,
	// 		spins,
	// 		stats,
	// 	})
	// })
})

httpServer.listen(process.env.PORT || 4000, () => {
	console.log(`> Realtime API running on port ${PORT}`)

	try {
		mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		const mongoDb = mongoose.connection
		mongoDb.on(
			'error',
			console.error.bind(console, 'database connection error')
		)
		mongoDb.once('open', () => console.log('connected to Mongo DB'))
	} catch (error) {
		console.error(error)
	}
	console.log(`> Socket initialized on port ${process.env.PORT}`)
})
