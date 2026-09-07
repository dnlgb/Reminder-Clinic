
import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import './App.css'
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import DashboardSummary from "./components/DashboardSummary";
import Callbacks from "./pages/Callbacks";
import type { Client, Callback } from "./types"
function App() {

//refactori
const [clients, setClients] = useState<Client[]>([])

const addClient = (newClient: Client) =>{
    setClients([...clients, newClient])}
  
const deleteClient = (clientToDelete: Client) => {
  setClients(
    clients.filter(
      (currentClient) => clientToDelete.phone !== currentClient.phone
    )
  )

}
const [editingClient, setEditingClient] = useState< Client| null>(null)
const startEditing = (client : Client) => {
    console.log(client)
  setEditingClient(client)
}

const updateClient = (updatedClient:Client) => {
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

  const handleComplete = (callbackComplete: Callback) => {
        setCallbacks(
            callbacks.map((currentCallback) => {
            if(currentCallback.id === callbackComplete.id) {
                return {...currentCallback, status: "completed" }
            }else{
                return currentCallback
            }
            })
        )
    }


  return (
    <>
      <h1>Callback Clinic</h1>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardSummary
        callbacks={callbacks}
        handleComplete={handleComplete}
        />}/>
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
        <Route path="/callbacks" 
        element={<Callbacks/>} 
        />
        </Route>
      </Routes>
    </>
  )
}



export default App
