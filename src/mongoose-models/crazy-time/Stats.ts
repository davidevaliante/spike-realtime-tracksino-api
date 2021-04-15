import { CrazyTimeSymbol } from './Symbols'

export class CrazyTimeStats {
    constructor(
        public timeFrame : number,
        public totalSpins : number,
        public stats : SymbolStats[]
    ){}
}

export class SymbolStats {
    constructor(
        public symbol : CrazyTimeSymbol, 
        public percentage : number,
        public spinSince : number,
        public lands : number
    ){}
}