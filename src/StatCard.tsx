function StatCard (
    {title, value, label}: {
        title: string
        value: number
        label: string
    }
) {
    return(
        
        <div className="stat-card">
            <span>{title}</span>
            <strong>{value}</strong>
            <span>{label}</span>
        </div>
        
    )
} export default StatCard;