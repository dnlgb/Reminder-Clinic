function ClientList({
    clients,
    onEditClient,
    onDeleteClient
        }: {
        clients: { name: string; phone: string, email: string, source: string, treatmentStatus: string, notes: string}[]

    onDeleteClient: (client: { name: string; phone: string, email: string, source: string, treatmentStatus: string, notes: string }) => void
onEditClient: (client: {
    name: string
    phone: string
    email: string
    source: string
    treatmentStatus: string
    notes: string}) => void
})
{
    return (
    <section>
        <h2>Clientes</h2>
        <ul>
            {clients.map((client) => (
                <><li key={client.phone}>{`${client.name} - ${client.phone} ${client.email} ${client.source} ${client.treatmentStatus} ${client.notes}`}</li>
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
                </button></>
                
                
            ))}
        </ul>
    </section>
    )
}

export default ClientList