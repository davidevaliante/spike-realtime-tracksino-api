import express, { Response, Request } from 'express'
import { SpinModel } from '../mongoose-models/crazy-time/Spin'
import { Spin } from '../mongoose-models/crazy-time/Spin';
import { CrazyTimeSymbol } from '../mongoose-models/crazy-time/Symbols'
import { CrazyTimeStats, SymbolStats } from './../mongoose-models/crazy-time/Stats';
const router = express.Router()
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'

router.post('/write-spins', async (request : Request, response : Response) => {
    try{
        const list = request.body
        const bulkUpdate = await SpinModel.bulkWrite(list.map((spin : Spin) => ({
            updateOne: {
                filter: { _id: spin._id },
                update: { ...spin },
                upsert:  true
            }
        })))

        response.send({
            updated : bulkUpdate.modifiedCount,
            upserted : bulkUpdate.upsertedCount
        })
    }catch(e){
        response.send({error : e})
    }
})

router.get('/get-all', async (request : Request, response : Response) => {
    const allSpins = await SpinModel.find()
    response.send({allSpins})
})

router.get('/get-latest/:count', async (request : Request, response : Response) => {
    try {
        const {count} = request.params
        const allSpins = await SpinModel.find().limit(parseInt(count)).sort({'timeOfSpin' : -1})
        response.send({allSpins})
    } catch (error) {
        response.send({ error })
    }
})

router.get('/get-hour', async (request : Request, response : Response) => {

    try {
        const now = new Date().getTime() + 60 * 60 * 2 * 1000
        const timeSince = now - 1 * 60 * 60 * 1000
        const spinsInTimeFrame = await SpinModel.where('timeOfSpin').gte(timeSince).sort({'timeOfSpin' : -1}) as Spin[]
        response.send({spinsInTimeFrame})
    } catch (error) {
        response.send({ error })
    }
})
router.get('/stats-in-the-last-hours/:hours', async (request : Request, response : Response) => {
    try {
        const { hours } = request.params
        const now = new Date().getTime() + 60 * 60 * 2 * 1000
        const timeSince = now - parseInt(hours) * 60 * 60 * 1000
        const spinsInTimeFrame = await SpinModel.where('timeOfSpin').gte(timeSince).sort({'timeOfSpin' : -1}) as Spin[]

        const totalSpins = spinsInTimeFrame.length

        

        const stats = new CrazyTimeStats(
            timeSince,
            totalSpins,
            Object.values(CrazyTimeSymbol).filter(it => typeof(it) !== 'number').map((symbol : CrazyTimeSymbol) => new SymbolStats(
                symbol,
                spinsInTimeFrame.filter(it => it.slotResultSymbol === symbol.toString()).length * 100 / totalSpins,
                0,
                spinsInTimeFrame.filter(it => it.slotResultSymbol === symbol.toString()).length
            ))
        )
        response.send({timeSince, stats, spinsInTimeFrame})
    } catch (error) {
        response.send({ error })
    }
})

router.get('/delete-all', async (request : Request, response : Response) => {
    const deleted = await SpinModel.deleteMany({})
    const remaining = await SpinModel.find()
    response.send({deleted,remaining})
})

export default router
