export enum TimeFrame {
    ONE_HOUR = '1h',
    THREE_HOURS = '3h',
    SIX_HOURS = '6h',
    TWELVE_HOURS = '12h',
    TWENTY_FOUR_HOURS = '24h',
    ONE_WEEK = '1w',
    ONE_MONTH = '1M'
}

export const timeFrameValueToHours = (tfv : string) => {
    if(tfv === '1h') return 1
    if(tfv === '3h') return 3
    if(tfv === '6h') return 6
    if(tfv === '12h') return 12
    if(tfv === '24h') return 24
    if(tfv === '1w') return 168
    if(tfv === '1M') return 672
}