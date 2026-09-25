import type { CallbackWithClient } from "../types"
import "../Styles/Home.css"
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
                                    <span className="callback-status">
                                        {callback.status}
                                    </span>
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
                                        {Array.from({
                                            length: Math.min(
                                                todayCallbacks.filter(
                                                    (callback) =>
                                                        callback.call_result === "accepted"
                                                ).length,
                                                4
                                            )
                                        }).map((_, index) => (
                                            <span
                                                className="accepted-dot"
                                                key={index}
                                            ></span>
                                        ))}
                                    </div>
                                </div>

                                <span className="workflow-count">
                                    {todayCallbacks.filter(
                                        (callback) =>
                                            callback.call_result === "accepted"
                                    ).length}
                                </span>
                            </div>

                            <div className="workflow-row">
                                <div className="workflow-label">
                                    <strong>Rescheduled</strong>

                                    <div className="workflow-dots">
                                        {Array.from({
                                            length: Math.min(
                                                todayCallbacks.filter(
                                                    (callback) =>
                                                        callback.call_result === "rescheduled"
                                                ).length,
                                                4
                                            )
                                        }).map((_, index) => (
                                            <span
                                                className="rescheduled-dot"
                                                key={index}
                                            ></span>
                                        ))}
                                    </div>
                                </div>

                                <span className="workflow-count">
                                    {todayCallbacks.filter(
                                        (callback) =>
                                            callback.call_result === "rescheduled"
                                    ).length}
                                </span>
                            </div>

                            <div className="workflow-row">
                                <div className="workflow-label">
                                    <strong>Declined</strong>

                                    <div className="workflow-dots">
                                        {Array.from({
                                            length: Math.min(
                                                todayCallbacks.filter(
                                                    (callback) =>
                                                        callback.call_result === "declined"
                                                ).length,
                                                4
                                            )
                                        }).map((_, index) => (
                                            <span
                                                className="declined-dot"
                                                key={index}
                                            ></span>
                                        ))}
                                    </div>
                                </div>

                                <span className="workflow-count">
                                    {todayCallbacks.filter(
                                        (callback) =>
                                            callback.call_result === "declined"
                                    ).length}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="today-overview">
                        <h2>Today's overview</h2>

                        <div className="overview-stats">
                            <div>
                                <strong>{todayCallbacks.length}</strong>
                                <span>Total callbacks today</span>
                            </div>

                            <div>
                                <strong>
                                    {todayCallbacks.filter(
                                        (callback) =>
                                            callback.status === "completed"
                                    ).length}
                                </strong>
                                <span>Completed</span>
                            </div>
                        </div>
                    </div>

                </aside>

            </section>
        </>
    )
}

export default DashboardSummary