import { useState } from "react";
import type { ClientWithApp } from "../types"
import "../styles/clientList.css"

function ClientList({
    clients,
    onEditClient,
    onDeleteClient,
    onSelectClient
        }: {
        clients: ClientWithApp[]
        onDeleteClient: (client: ClientWithApp) => void
        onEditClient: (client: ClientWithApp) => void
        onSelectClient: (client: ClientWithApp) => void
})
{
    const [search, setSearch] = useState("")
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const clientsPerPage = 10

const filteredClients = clients.filter((currentClient) =>
    currentClient.name
        .toLowerCase()
        .includes(search.toLowerCase()))

const totalPages = Math.ceil(
    filteredClients.length / clientsPerPage)

const startIndex = (currentPage - 1) * clientsPerPage
const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + clientsPerPage)
    return (
    <section className="client-list">
        <div className="client-list-header">
            <h2>Clients</h2>
            
        </div>

        <input
            className="client-search"
            type="text"
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
            }}
            placeholder="search clients..."
        />

        <ul>
            {paginatedClients.map((client) => (
                <li key={client.id} className="client-item">

                    <div
                        className="client-info"
                        onClick={() => onSelectClient(client)}
                    >
                        {`${client.name} - ${client.apps?.name}`}
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

        {totalPages > 1 && (
            <div className="client-pagination">

                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                        setCurrentPage((page) => page - 1)
                    }
                >
                    ‹
                </button>

                <span>
                    {startIndex + 1}-
                    {Math.min(
                        startIndex + clientsPerPage,
                        filteredClients.length
                    )}{" "}
                    de {filteredClients.length}
                </span>

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                        setCurrentPage((page) => page + 1)
                    }
                >
                    ›
                </button>

            </div>
        )}

    </section>
)
}

export default ClientList