import { useState } from "react";
import type { ClientWithApp } from "../types"
import "../styles/clientList.css"

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
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    return (
    <section className="client-list">
        <div className="client-list-header">
            <h2>Clientes</h2>
        </div>

            <input
            className="client-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search clients..."
        
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
        onClick={() =>
            setOpenMenu(
                openMenu === client.id
                    ? null
                    : client.id
            )
        }
    >
        ⋯
    </button>

    {openMenu === client.id && (
        <div className="client-menu">

            <button
                type="button"
                onClick={() => {
                    onCallbackClient(client)
                    setOpenMenu(null)
                }}
            >
                Create callback
            </button>

            <button
                type="button"
                onClick={() => {
                    onEditClient(client)
                    setOpenMenu(null)
                }}
            >
                Edit client
            </button>

            <button
                type="button"
                onClick={() => {
                    onDeleteClient(client)
                    setOpenMenu(null)
                }}
            >
                Delete client
            </button>

        </div>
    )}
        </div>
    </li>
    ))}
</ul>
    </section>
    )
}

export default ClientList