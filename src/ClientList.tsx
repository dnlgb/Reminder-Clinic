function ClientList( {clients}: {clients: {name: string ; phone: string} []}) {
    return (
    <section>
        <h2>Clientes</h2>
        <ul>
            {clients.map((client) => (
                <li>{`${client.name} - ${client.phone}`}</li>
            ))}
        </ul>
    </section>
    )
}

export default ClientList