import { useState } from "react"
import type { Client, NewCallback } from "../types"
import "../styles/CallbacklForm.css"

function CallbacksForm({

    onAddCallback,
    client
}: {
    onAddCallback: (callback: NewCallback) => void
    client: Client
}) {
//recibe un solo cliente porque el callback se crea desde ese cliente
    const [scheduledAt, setScheduledAt] = useState("")
    const [notes, setNotes] = useState("")
    const [error, setError] = useState("")

    return (
        <div className="callback-form">

            <h3>Callback for {client.name}</h3>

            <label>
                Date:
                <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => {
                        setScheduledAt(e.target.value)
                        setError("")
                    }}
                />
            </label>

            <label>
                Note:
                <input
                    type="text"
                    value={notes}
                     //obtenemos lo que el usuario escribe en tiempo real(onChange)
                    onChange={(e) => setNotes(e.target.value)}
                />
            </label>

            {error && (
                <p className="callback-form-error">
                    {error}
                </p>
            )}

            <button
                type="button"
                name="Boton"
                onClick={() => {

                    if (!scheduledAt) {
                        setError("Callback date and time are required")
                        return
                    }

                    setError("")

                    onAddCallback({
                        client_id: client.id,
                        scheduled_at: scheduledAt,
                        notes: notes.trim() || undefined
                    })
                }}
            >
                Save callback
            </button>

        </div>
    )
}

export default CallbacksForm