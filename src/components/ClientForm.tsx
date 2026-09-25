import { useState } from "react"
import { useEffect } from "react"
import type { Client, NewClient } from "../types"
import { supabase } from "../lib/supabase"
import { data } from "react-router-dom"
import "../styles/ClientForm.css"

function ClientForm(
    {onCreateClientndCallbck, editingClient, onUpdateClient}: {
    onCreateClientndCallbck: (
        cliente: NewClient,
        callback: {
        scheduled_at: string
        notes?: string
    }
) => void
        editingClient: Client | null
        onUpdateClient: (cliente: Client) => void
    }
){
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [apps, setApps] = useState<{ id: string; name: string }[]>([])
    const [source, setSource] = useState("");

    const[scheduledAt, setScheduledAt] = useState("")
    const[notes, setNotes] = useState("")

    useEffect(() => {
        const loadApps = async () => {
            const {data} = await supabase
                .from("apps")
                .select("*")

            console.log("Apps:", data)

            if (data) {
                setApps(data)
            }
        }

        loadApps()
    },[])

    useEffect(() => {
        console.log(editingClient)

        if (editingClient) {
            setName(editingClient.name)
            setPhone(editingClient.phone)
            setSource(editingClient.source)
        }
    }, [editingClient])
        

    return (
    <section className="client-form-card">

            <div className="client-form-header">
                <div>
                    <h2>Register a new client</h2>
                    <p>
                        Enter the client's information and schedule their first callback.
                    </p>
                </div>
            </div>

            <div className="client-form-section">

                <div className="client-form-section-header">
                    <span className="step-number">1</span>

                    <div>
                        <h3>Client information</h3>
                        <p>Enter the client's basic details.</p>
                    </div>
                </div>

                <label>
                    Full name
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Carlos Rodríguez"
                    />
                </label>

                <label>
                    Phone number
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +57 300 123 4567"
                    />
                </label>

                <label>
                    App / Source
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                    >
                        <option value="">Select app</option>

                        {apps.map((app) => (
                            <option key={app.id} value={app.id}>
                                {app.name}
                            </option>
                        ))}
                    </select>
                </label>

            </div>

            <div className="client-form-section">

                <div className="client-form-section-header">
                    <span className="step-number">2</span>

                    <div>
                        <h3>First callback</h3>
                        <p>Schedule the client's first follow-up call.</p>
                    </div>
                </div>

                <label>
                    Date and time
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                    />
                </label>

                <label>
                    Note <span>(optional)</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add a note about this callback..."
                    />
                </label>

            </div>

            <button
                type="button"
                className="client-form-submit"
                onClick={() => {

                    const client = {
                        name,
                        phone,
                        source
                    }

                    if (editingClient) {

                        const updatedClient = {
                            id: editingClient.id,
                            name,
                            phone,
                            source,
                            active: editingClient.active
                        }

                        onUpdateClient(updatedClient)

                    } else {
                        onCreateClientndCallbck(
                            client,
                            {
                                scheduled_at: scheduledAt,
                                notes: notes || undefined
                            }
                        )

                    }
                }}
            >
                {editingClient
                    ? "Save changes"
                    : "Create client & callback"
                }
            </button>

        </section>
    )
}

export default ClientForm