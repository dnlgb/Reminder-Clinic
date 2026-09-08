import { useState } from "react"
import type { Callback, NewCallback } from "../types"


function CallbacksForm ({
//me recibe un callbck pero no devuelve nada(void)
//solo recibe callbacks
    onAddCallback}: {
        onAddCallback: (Callback: NewCallback) => void
    }){
    const [patient, setPatient] = useState("")
    const [date, setDate] = useState("")
    const [reason, setReason] = useState("")
    const [status, setStatus] = useState("pending")
return(
    <>
    <label>
        Patient:
        <input type="text"
        value={patient}
        onChange={(e) => setPatient(e.target.value)}/>
    </label>
    <label>
        Date:
        <input type="text"
        value={date}
        //obtenemos lo que el usuario escribe en tiempo real(onChange)
        onChange={(e) => setDate(e.target.value)}/>
    </label>
    <label>
        Reason:
        <input type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)} />
    </label>
    <button
    type="button"
    name="Boton"
    onClick={() =>
        {onAddCallback({
            patient, date, reason, status
        })
        console.log(onAddCallback)
    }}
    
    >
        Add callback
    </button>
    </>
    )
}export default CallbacksForm