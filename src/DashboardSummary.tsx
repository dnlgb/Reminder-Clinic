import StatCard from "./StatCard"

function DashboardSummary () {
    return(
    <>
        <section className="dashboard-summary">
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