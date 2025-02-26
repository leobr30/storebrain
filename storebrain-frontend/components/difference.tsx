export const Difference = ({difference,symbol}:{difference:number, symbol?: string}) => {
    if(typeof difference !== 'number') {
        console.log(typeof difference)
    } else {
        const formatDifference = difference.toLocaleString()
        if (difference < 0) return <span className="text-destructive">({formatDifference}{symbol})</span>
        else if (difference > 0) return <span className="text-success">(+{formatDifference}{symbol})</span>
        else return <span>(=)</span>
    }
    
}