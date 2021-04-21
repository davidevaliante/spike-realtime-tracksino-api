import { Spin, SpinModel } from '../mongoose-models/crazy-time/Spin'
import { CrazyTimeStats, SymbolStats } from '../mongoose-models/crazy-time/Stats'
import { CrazyTimeSymbol } from '../mongoose-models/crazy-time/Symbols'

export const getLatestSpins = async (count : number) => {
    const allSpins = await SpinModel.find().limit(count).sort({'timeOfSpin' : -1})
    return allSpins
}

export const getStatsInTheLastHours = async (hoursToCheck : number) => {

    const now = new Date().getTime()

    const timeSince = now - hoursToCheck * 60 * 60 * 1000 - 5 * 1000

    const spinsInTimeFrame = await SpinModel.where('timeOfSpin').gte(timeSince).sort({'timeOfSpin' : -1}) as Spin[]

    const totalSpins = spinsInTimeFrame.length
    
    const stats = new CrazyTimeStats(
        timeSince,
        totalSpins,
        Object.values(CrazyTimeSymbol).filter(it => typeof(it) !== 'number').map((symbol : CrazyTimeSymbol) => new SymbolStats(
            symbol,
            spinsInTimeFrame.filter(it => it.spinResultSymbol === symbol.toString()).length * 100 / totalSpins,
            0,
            spinsInTimeFrame.filter(it => it.spinResultSymbol === symbol.toString()).length
        ))
    )

    return stats
}