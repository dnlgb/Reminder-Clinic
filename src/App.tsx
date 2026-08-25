
import ClientForm from './ClientForm'
import ClientList from './ClientList'
import { useState } from "react";


function App() {

const [clients, setClients] = useState<({ name: string; phone: string }[])> ([])
const addClient = (newClient: {name: string; phone : string}) => {
    setClients([...clients, newClient])}
const deleteClient = (clientToDelete: {name: string, phone: string}) => {
  setClients(
    clients.filter(
      (currentClient) => clientToDelete.phone != currentClient.phone
    )
  )
}


  return (
    <>
      <h1>Callback Clinic</h1>
      <div>
      <ClientList clients = {clients}
      onDeleteClient={deleteClient}/>
      </div>
      <div>
      <ClientForm onAddClient={addClient}/>
      </div>
      
    </>
  )
}



export default App
