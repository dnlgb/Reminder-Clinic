
import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import './App.css'
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import DashboardSummary from "./components/DashboardSummary";
import Callbacks from "./pages/Callbacks";
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
const [editingClient, setEditingClient] = useState<{
  name: string
  phone: string
  email: string
  source: string
  treatmentStatus: string
  notes: string
} | null>(null)
const startEditing = (client : {
  name: string ,phone: string, email: string, source: string, treatmentStatus: string, notes: string}) => {
      console.log(client)
  setEditingClient(client)
}

const updateClient = (updatedClient: {
  name: string
  phone: string
  email: string
  source: string
  treatmentStatus: string
  notes: string}) => {
  setClients(
    clients.map((currentClient) => {
      if (currentClient.phone === updatedClient.phone) {
        return updatedClient
      }

      return currentClient
    })
  )
}

const [callbacks, setCallbacks] = useState(
        [
        {
            id: 1, patient: "dan", date: "2026-10-12 10:30", reason: "lorem ipsum xdxd",
            status: "pending"
        },
        {
            id: 2, patient: "juan", date: "2026-10-12 10:30", reason: "lorem ipsum xdxd",
            status: "pending"
        },
        {
            id: 3, patient: "meme", date: "2026-10-12 10:30", reason: "lorem ipsum xdxd",
            status: "pending"
        }
    ])


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
          <ClientForm onAddClient={addClient} 
          editingClient={editingClient}
          onUpdateClient={updateClient}/>
          
          <ClientList
            clients={clients}
            onDeleteClient={deleteClient}
            onEditClient={startEditing}
            
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
