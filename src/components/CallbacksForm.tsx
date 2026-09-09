import { useState } from "react"
import type { Client, NewCallback } from "../types"


function CallbacksForm ({
//me recibe un callbck pero no devuelve nada(void)
//solo recibe callbacks
    onAddCallback, clients}: {
        onAddCallback: (callback: NewCallback) => void
        clients: Client[]
    }){
    const [date, setDate] = useState("")
    const [reason, setReason] = useState("")
    const [status, setStatus] = useState("pending")
    const [selectedClient, setSelectedClient] = useState("")
return(
<div className="callback-form">
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
    <label>
        Patient:
        <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
        >
            {clients.map((client) => (
            <option key={client.phone} value={client.phone}>
                {client.name}
            </option>
            ))}
        </select>
    </label>
    <button
    type="button"
    name="Boton"
    onClick={() =>
        {onAddCallback({
            patient: selectedClient, date, reason, status
        })
        console.log(onAddCallback)
    }}
    
    >
        Add callback
    </button>
</div>
    )
}export default CallbacksForm