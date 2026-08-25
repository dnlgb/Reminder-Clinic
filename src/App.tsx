
import ClientForm from './ClientForm'
import ClientList from './ClientList'
import { useState } from "react";


function App() {

const [clients, setClients] = useState<({ name: string; phone: string }[])> ([])
const addClient = (newClient: {name: string; phone : string}) => {
    setClients([...clients, newClient])
}
  return (
    <>
      <h1>Callback Clinic</h1>
      <ClientList clients = {clients}/>
      <div>
      <ClientForm onAddClient={addClient}/>
      </div>
      
    </>
  )
}



export default App
