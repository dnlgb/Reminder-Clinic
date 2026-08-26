
import { useState } from "react";
import MainLayout from "./MainLayout";
import './App.css'
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
        <MainLayout clients={clients}
        addClient={addClient}
        deleteClient={deleteClient}/>
      </div>
    </>
  )
}



export default App
