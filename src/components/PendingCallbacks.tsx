import type {Callback } from "../types"

function PendingCallbacks({callbacks ,handleComplete}: {
    callbacks: Callback[]
    handleComplete: (callback: Callback) => void
}) {

    return(
        <section>
            <h2>Pending</h2>
            <div className="callback-list">
                {callbacks.filter((currentCallback) => 
                currentCallback.status === "pending").map((callback) =>
                <div className="callback-dataR" key={callback.id}>
                    <span>{callback.patient}</span>
                    <strong>{callback.date}</strong>
                    <span>{callback.reason}</span>
                    <span>{callback.status}</span>
                    <button 
                    type="button"
                    onClick={() => {
                        handleComplete(callback)
                    }}
                    >Boton11</button>
                </div>
                )}
            </div>    
        </section>
    )
}export default PendingCallbacks;