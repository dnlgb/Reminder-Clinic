import StatCard from "./StatCard"
import type {Callback } from "../types"
import PendingCallbacks from "./PendingCallbacks"
function DashboardSummary({
    callbacks,
    handleComplete
}: {
    callbacks: Callback[]
    handleComplete: (callback: Callback) => void
}) {
    return(
    <>
        <section className="dashboard-summary">
            <PendingCallbacks
                callbacks={callbacks}
                handleComplete={handleComplete}
                />
            <StatCard title={"Pending"}
                value={5}
                label={"Callback"}/>
            <StatCard title={"Today"}
                value={3}
                label={"Callback"}/>
            <StatCard title={"Completed"}
                value={10}
                label={"Callback"}/>
            
            
        </section>
    </>
    )
}export default DashboardSummary;