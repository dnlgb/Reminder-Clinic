import { useState } from "react"
import { useEffect } from "react"
function ClientForm(
    {onAddClient, editingClient, onUpdateClient}: {
        onAddClient:
        (cliente: {name: string ,phone: string, email: string, source: string, treatmentStatus: string, notes: string}) => void
        editingClient: {
    name: string
    phone: string
    email: string
    source: string
    treatmentStatus: string
    notes: string
    } | null
    
    onUpdateClient: (cliente: {
    name: string
    phone: string
    email: string
    source: string
    treatmentStatus: string
    notes: string
    }) => void
}
    ){
    const [name, setName] = useState("");    
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [source, setSource] = useState("");
    const [treatmentStatus, setTreatmentStatus] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        console.log(editingClient)
    if (editingClient) {
    setName(editingClient.name)
    setPhone(editingClient.phone)
    setEmail(editingClient.email)
    setSource(editingClient.source)
    setTreatmentStatus(editingClient.treatmentStatus)
    setNotes(editingClient.notes)
    }
}, [editingClient])
    
    return(
    
    <form className="client-form">
        <label>Name:
            <input type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}/>
        </label>

        <label>Phone:
            <input type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}/>
        </label>

        <label>Email:
            <input type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
        </label>

        <label>Source:
            <input type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}/>
        </label>

        <label>Treatmen Status:
            <input type="text"
                value={treatmentStatus}
                onChange={(e) => setTreatmentStatus(e.target.value)}/>
        </label>

        <label>Notes:
            <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}/>
        </label>
        <button
        type="button"
        onClick={() => {
            const client = {
        name,
        phone,
        email,
        source,
        treatmentStatus,
        notes
        }

    if (editingClient) {
        onUpdateClient(client)
    } else {
        onAddClient(client)
    }
    }}>
        {editingClient ? "Save changes" : "Add client"}
    </button>

    </form>
    )
} export default ClientForm