import { useState } from "react"
import type { Client, NewCallback } from "../types"


function CallbacksForm ({
//recibe un solo cliente porque el callback se crea desde ese cliente
    onAddCallback, client}: {
        onAddCallback: (callback: NewCallback) => void
        client: Client
    }){

    //guarda la fecha y hora que el usuario selecciona
    const [scheduledAt, setScheduledAt] = useState("")

    //guarda la nota opcional del callback
    const [notes, setNotes] = useState("")

return(
<div className="callback-form">

    {/*muestra el cliente al que pertenece el callback*/}
    <h3>Callback for {client.name}</h3>

    <label>
        Date:
        <input
        type="datetime-local"
        value={scheduledAt}
        //obtenemos lo que el usuario escribe en tiempo real(onChange)
        onChange={(e) => setScheduledAt(e.target.value)}
        />
    </label>

    <label>
        Note:
        <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        />
    </label>

    <button
    type="button"
    name="Boton"
    onClick={() =>
        {
            //creamos el callback usando el id del cliente seleccionado
            onAddCallback({
                client_id: client.id,
                scheduled_at: scheduledAt,
                notes: notes || undefined
            })

            console.log(onAddCallback)
        }
    }
    >
        Save callback
    </button>
</div>
    )
}

export default CallbacksForm