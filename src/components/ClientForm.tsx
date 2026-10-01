import { useState } from "react"
import { useEffect } from "react"
import type { Client, NewClient } from "../types"
import { supabase } from "../lib/supabase"
import "../styles/ClientForm.css"

function ClientForm(
    {
        onCreateClientndCallbck,
        editingClient,
        onUpdateClient
    }: {
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
) {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [apps, setApps] = useState<{ id: string; name: string }[]>([])
    const [source, setSource] = useState("")

    const [scheduledAt, setScheduledAt] = useState("")
    const [notes, setNotes] = useState("")

    const [error, setError] = useState("")

    useEffect(() => {
        const loadApps = async () => {
            const { data } = await supabase
                .from("apps")
                .select("*")

            if (data) {
                setApps(data)
            }
        }

        loadApps()
    }, [])

    useEffect(() => {
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
                        onChange={(e) => {
                            setName(e.target.value)
                            setError("")
                        }}
                        placeholder="e.g. Carlos Rodríguez"
                    />
                </label>

                <label>
                    Phone number
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value)
                            setError("")
                        }}
                        placeholder="e.g. +57 300 123 4567"
                    />
                </label>

                <label>
                    App / Source
                    <select
                        value={source}
                        onChange={(e) => {
                            setSource(e.target.value)
                            setError("")
                        }}
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
                        onChange={(e) => {
                            setScheduledAt(e.target.value)
                            setError("")
                        }}
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

            {error && (
                <p className="client-form-error">
                    {error}
                </p>
            )}

            <button
                type="button"
                className="client-form-submit"
                onClick={() => {

                    if (!name.trim()) {
                        setError("Name is required")
                        return
                    }

                    if (!phone.trim()) {
                        setError("Phone number is required")
                        return
                    }

                    if (!source) {
                        setError("Please select an app")
                        return
                    }

                    if (!editingClient && !scheduledAt) {
                        setError("Callback date and time are required")
                        return
                    }

                    setError("")

                    if (editingClient) {

                        const updatedClient = {
                            id: editingClient.id,
                            name: name.trim(),
                            phone: phone.trim(),
                            source,
                            active: editingClient.active
                        }

                        onUpdateClient(updatedClient)

                    } else {

                        const client = {
                            name: name.trim(),
                            phone: phone.trim(),
                            source
                        }

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