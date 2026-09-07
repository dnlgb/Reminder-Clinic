import { useState } from "react"

function PendingCallbacks() {
    const showCallback = (callback: {
        id: number
        patient: string
        date: string
        reason: string
        }) => {
            console.log(callback)
        }

    const handleComplete = (callbackComplete: {
        id: number
        patient: string
        date: string
        reason: string
        status: string
    }) => {
        setCallbacks(
            callbacks.map((currentCallback) => {
            if(currentCallback.id === callbackComplete.id) {
                return {...currentCallback, status: "completed" }
            }else{
                return currentCallback
            }
            })
        )
    }
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
                    >Boton</button>
                </div>
                )}
            </div>    
        </section>
    )
}export default PendingCallbacks;