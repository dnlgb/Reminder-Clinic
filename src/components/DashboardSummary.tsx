import type { CallbackWithClient } from "../types"

function DashboardSummary({
    callbacks
}: {
    callbacks: CallbackWithClient[]
}) {
    //filtra los callbacks para mostrar solo los de hoy
    const today = new Date()
    const todayCallbacks = callbacks.filter((callback) => {
        if (callback.status === "cancelled") return false

        const callbackDate = new Date(callback.scheduled_at)
        return (
            //compara la fecha del callback con la fe hoy
            callbackDate.getFullYear() === today.getFullYear() &&
            callbackDate.getMonth() === today.getMonth() &&
            callbackDate.getDate() === today.getDate()
        )
    })

    return(
<>
        <section className="dashboard-header">
            <h2>Good morning</h2>
            <p>Here's what needs your attention today.</p>
        </section>

        <section className="dashboard-main">

        <section className="today-callbacks">
                <h2>Today's callbacks</h2>

                <div className="callback-timeline">
                    {todayCallbacks.map((callback) => (
                        <div className="timeline-item" key={callback.id}>
                            <span> 
                                {new Date(callback.scheduled_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                                })}
                            </span>

                            <div className="timeline-dot"></div>

                            <div className="timeline-content">
                                <strong>{callback.clientes?.name}</strong>
                                <span className="callback-status">{callback.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        <aside className="dashboard-side">

            <div className="daily-workflow">
                <h2>Daily workflow</h2>
                    <span>Results from completed callbacks</span>

                <div className="workflow-result">
                    <div className="workflow-row">
        <div className="workflow-label">
            <strong>Accepted</strong>

            <div className="workflow-dots">
                <span className="accepted-dot"></span>
                <span className="accepted-dot"></span>
                <span className="accepted-dot"></span>
                <span className="accepted-dot"></span>
            </div>
        </div>

        <span className="workflow-count">
            {todayCallbacks.filter(
                (callback) => callback.call_result === "accepted"
            ).length}
        </span>
    </div>

    <div className="workflow-row">
        <div className="workflow-label">
            <strong>Rescheduled</strong>

            <div className="workflow-dots">
                <span className="rescheduled-dot"></span>
                <span className="rescheduled-dot"></span>
            </div>
        </div>

        <span className="workflow-count">
            {todayCallbacks.filter(
                (callback) => callback.call_result === "rescheduled"
            ).length}
        </span>
    </div>

    <div className="workflow-row">
        <div className="workflow-label">
            <strong>Declined</strong>

            <div className="workflow-dots">
                <span className="declined-dot"></span>
            </div>
        </div>

        <span className="workflow-count">
            {todayCallbacks.filter(
                (callback) => callback.call_result === "declined"
            ).length}
        </span>
    </div>
                </div>
</div>  

            </aside>

        </section>
</>
    )
}

export default DashboardSummary