import { useState } from "react";
import type { ClientWithApp } from "../types"


function ClientList({
    clients,
    onEditClient,
    onDeleteClient,
    onCallbackClient
        }: {
        clients: ClientWithApp[]
        onDeleteClient: (client: ClientWithApp) => void
        onEditClient: (client: ClientWithApp) => void
        onCallbackClient: (client: ClientWithApp) => void
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
    <li key={client.id} className="client-item">
            <div className="client-info">
            {`${client.name} - ${client.phone} ${client.apps?.name}`}
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

            <button
                type="button"
                onClick={() => onCallbackClient(client)}
            >
                Callback
            </button>
        </div>
    </li>
    ))}
</ul>
    </section>
    )
}

export default ClientList