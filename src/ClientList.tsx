function ClientList({
    clients,
    onDeleteClient
        }: {
        clients: { name: string; phone: string }[]
    onDeleteClient: (client: { name: string; phone: string }) => void
}){
    return (
    <section>
        <h2>Clientes</h2>
        <ul>
            {clients.map((client) => (
                <><li key={client.phone}>{`${client.name} - ${client.phone}`}</li>
                <button
                    type="button"
                    onClick={() => onDeleteClient(client)}
                >
                    Delete
                </button></>
            ))}
        </ul>
    </section>
    )
}

export default ClientList