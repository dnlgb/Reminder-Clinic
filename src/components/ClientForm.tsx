import { useState } from "react"
import { useEffect } from "react"
import type { Client, NewClient } from "../types"
import { supabase } from "../lib/supabase"
function ClientForm(
    {onAddClient, editingClient, onUpdateClient}: {
        onAddClient:
        (cliente: NewClient ) => void
        editingClient: Client| null
        onUpdateClient: (cliente: Client) => void
}
    ){
    const [name, setName] = useState("");    
    const [phone, setPhone] = useState("");
    //crea un lugar en la memoria de React para guardar temporalmente la respuesta que venga de Sb.
    const [apps, setApps] = useState<{ id: string; name: string }[]>([])
    const [source, setSource] = useState("");
    
    useEffect(() => {
    //pedimos las apps que existen en sb
        const loadApps = async () => {
    //espera la respuesta de sb y sacamos los datos
        const {data} = await supabase
            .from("apps")
            .select("*")
            console.log("Apps:", data)
        if (data) {
        setApps(data)
        }
    }
    loadApps()
    //[] hace que se ejecute una sola vez al montar clientf
    },[])


    useEffect(() => {
        console.log(editingClient)
    if (editingClient) {
    setName(editingClient.name)
    setPhone(editingClient.phone)
    setSource(editingClient.source)
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


        <label>App:
        <select
            value={source}
            onChange={(e) =>{setSource(e.target.value)}}>
                <option value="">-</option>
            {apps.map((app) =>(
            <option key={app.id} value={app.id}> 
                {app.name}
            </option>
            ))}   
        </select>
        </label>

        <button
        type="button"
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
            source
        }
        onUpdateClient(updatedClient)
    } else {
        onAddClient(client)
    }
    }}>
        {editingClient ? "Save changes" : "Add client"}
    </button>

    </form>
    )
} export default ClientForm