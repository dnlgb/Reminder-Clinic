import { useState } from "react"

function ClientForm(
    {onAddClient}: {
        onAddClient: (cliente: {name: string ,phone: string, email: string, source: string, treatmentStatus: string, notes: string}) => void}){
    const [name, setName] = useState("");    
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [source, setSource] = useState("");
    const [treatmentStatus, setTreatmentStatus] = useState("");
    const [notes, setNotes] = useState("");
    return(
        <>
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
            <input type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}/>
        </label>
        
            <button type="button"
            onClick={
                () => {
                    onAddClient(
                        {
                            name: name, phone: phone,
                            email: email, source: source,
                            treatmentStatus: treatmentStatus,
                            notes: notes

                        }
                    )
                }
            }>
            add client
            </button>
        </>
    )
} export default ClientForm