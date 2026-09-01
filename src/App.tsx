
import { useState } from "react";
import MainLayout from "./MainLayout";
import './App.css'
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import ClientList from "./ClientList";
import ClientForm from "./ClientForm";
import DashboardSummary from "./DashboardSummary";
import Callbacks from "./Callbacks";
function App() {

const [clients, setClients] = useState<({ name: string; phone: string, email: string, source: string, treatmentStatus: string, notes: string }[])> ([])

const addClient = (newClient: {name: string; phone: string, email: string, source: string, treatmentStatus: string, notes: string}) =>{
    setClients([...clients, newClient])}
  
const deleteClient = (clientToDelete: {name: string, phone: string, email : string, source: string, treatmentStatus: string, notes : string}) => {
  setClients(
    clients.filter(
      (currentClient) => clientToDelete.phone !== currentClient.phone
    )
  )
}

  return (
    <>
      <h1>Callback Clinic</h1>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardSummary/>}/>
        <Route
          path="/clients"
          element={
          <>
          <ClientForm onAddClient={addClient} />
          <ClientList
            clients={clients}
            onDeleteClient={deleteClient}
          />
        </>
      }
      
    />
        <Route path="/callbacks" element={<Callbacks />} />
        </Route>
      </Routes>
    </>
  )
}



export default App
