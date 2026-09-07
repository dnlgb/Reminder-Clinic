import { useState } from "react";
import type { Client } from "../types"
function ClientList({
    clients,
    onEditClient,
    onDeleteClient
        }: {
        clients: Client[]

    onDeleteClient: (client: Client) => void
onEditClient: (client: Client) => void
})
{
    const [search, setSearch] = useState("")
    return (
    <section>
        <h2>Clientes</h2>
        <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        
        />
        
    <ul>
    {clients
    .filter((currentClient) =>
        currentClient.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((client) => (
    <>
    <li key={client.phone} className="client-item">
            <div className="client-info">
            {`${client.name} - ${client.phone} ${client.email} ${client.source} ${client.treatmentStatus} ${client.notes}`}
            </div>
        <div className="client-action">
            <button
                type="button"
                onClick={() => onEditClient(client)}
            >
                Edit
            </button>

            <button
                type="button"
                onClick={() => onDeleteClient(client)}
            >
                Delete
            </button>
        </div>
    </li>
    </>
    ))}
</ul>
    </section>
    )
}

export default ClientList