import { useState } from "react"

function ClientForm(
    {onAddClient}: {
        onAddClient: (cliente: {name: string ,phone: string}) => void}){
    const [name, setName] = useState("");    
    const [phone, setPhone] = useState("");
    return(
        <>
        <input type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}/>
        <input type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}/>
            <button type="button"
            onClick={
                () => {
                    onAddClient(
                        {
                            name: name, phone: phone
                        }
                    )
                }
            }>
            add client
            </button>
        </>
    )
} export default ClientForm