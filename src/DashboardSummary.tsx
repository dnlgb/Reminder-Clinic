function DashboardSummary (
    {pending, callbackT, callbackComp}: {
        pending: number
        callbackT: number
        callbackComp: number
    }

    
) {
    return(
    <>
        <section className="dashboard-summary">
            <div className="pending-card">
                <span>Pending:</span>
                <strong >{pending}</strong>
                <span>Callbacks</span>
            </div>
            <div className="today-card">
                <span>Today:</span>
                <strong>{callbackT}</strong>
                <span>Callback</span>
            </div>
            <div className="full-card">
                <span>Completed</span>
                <strong>{callbackComp}</strong>
                <span>Callback</span>
            </div>
        </section>
    </>
    )
}export default DashboardSummary;