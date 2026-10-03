import { useState } from "react"
import { useEffect } from "react"
import type { Client, NewClient } from "../types"
import { supabase } from "../lib/supabase"
import "../styles/ClientForm.css"
import { WarningCircle } from "@phosphor-icons/react"
import { Check } from "@phosphor-icons/react"

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
        ) => Promise<boolean>
        editingClient:{
                client: Client
                callback: {
                    id: string
                    scheduled_at: string
                    notes: string | null
                } | null
            } | null
        onUpdateClient: (data: {
            client: Client
                callback: {
                    id: string
                    scheduled_at: string
                    notes: string | null
                } | null
            }) => Promise<boolean>
    }
) {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [apps, setApps] = useState<{ id: string; name: string }[]>([])
    const [source, setSource] = useState("")

    const [scheduledAt, setScheduledAt] = useState("")
    const [notes, setNotes] = useState("")

    const [error, setError] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const showSavedMessage = () => {
    setShowSuccess(true)
    
    setTimeout(() => {
        setShowSuccess(false)
    }, 2000)
}

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
        setName(editingClient.client.name)
        setPhone(editingClient.client.phone)
        setSource(editingClient.client.source)

        if (editingClient.callback) {
            const date = new Date(editingClient.callback.scheduled_at)

            const localDate = new Date(
                date.getTime() - date.getTimezoneOffset() * 60000
            )
                .toISOString()
                .slice(0, 16)

            setScheduledAt(localDate)
            setNotes(editingClient.callback.notes ?? "")
        } else {
            setScheduledAt("")
            setNotes("")
        }
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
                        placeholder="Jhon Doe"
                    />
                </label>

                <label>
                    Phone number
                    <input
                        type="tel"
                        value={phone}
                        maxLength={10}
                         //obtenemos lo que el usuario escribe en tiempo real(onChange)
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                            setPhone(value)
                            setError("")
                        }}
                        placeholder="Phone number"
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
            <div className="client-form-error">
                <div className="client-form-error-icon">
                    <WarningCircle size={17} weight="regular" />
                </div>
                <div>
                    <strong>Missing information </strong>
                    <span>{error}</span>
                </div>
            </div>
            )}

            <button
                type="button"
    className="client-form-submit"
    disabled={isSaving}
    onClick={async () => {

        if (isSaving) return

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
        setIsSaving(true)

        try {

            if (editingClient) {
    const updatedClient = {
        client: {
            id: editingClient.client.id,
            name: name.trim(),
            phone: phone.trim(),
            source,
            active: editingClient.client.active
        },
        callback: editingClient.callback
            ? {
                id: editingClient.callback.id,
                scheduled_at: scheduledAt,
                notes: notes || null
            }
            : null
    }

    const success = await onUpdateClient(updatedClient)

    if (success !== false) {
        showSavedMessage()
    }

} else {
    const client = {
        name: name.trim(),
        phone: phone.trim(),
        source
    }

    const success = await onCreateClientndCallbck(
        client,
        {
            scheduled_at: scheduledAt,
            notes: notes || undefined
        }
    )

    if (success) {
        showSavedMessage()

        setName("")
        setPhone("")
        setSource("")
        setScheduledAt("")
        setNotes("")
    }
}

} catch (error) {
    console.log(error)
    setError("Something went wrong while saving")
} finally {
    setIsSaving(false)
}
}}
>
    {isSaving
        ? "Saving..."
        : editingClient
            ? "Save changes"
            : "Create client & callback"
    }
</button>

{showSuccess && (
    <div className="client-save-overlay">
        <div className="client-save-card">
            <div className="client-save-icon">
                <Check size={30} weight="bold" />
            </div>

            <strong>
                {editingClient ? "Client updated" : "Client created"}
            </strong>

            <span>
                {editingClient
                    ? "The client was updated successfully."
                    : "The client and first callback were created successfully."
                }
            </span>
        </div>
    </div>
)}

</section>
)
}

export default ClientForm