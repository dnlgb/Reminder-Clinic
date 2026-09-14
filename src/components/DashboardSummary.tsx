import type { Callback } from "../types"

function DashboardSummary({
    callbacks
}: {
    callbacks: Callback[]
}) {
    //filtra los callbacks para mostrar solo los de hoy
    const today = new Date()
    const todayCallbacks = callbacks.filter((callback) => {
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
                                <strong>{callback.client_id}</strong>
                                <span>{callback.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <aside className="dashboard-side">

                <div className="daily-workflow">
                    <h2>Daily workflow</h2>
                </div>

                <div className="today-overview">
                    <h2>Today's overview</h2>
                </div>

            </aside>

        </section>
    </>
    )
}export default DashboardSummary;