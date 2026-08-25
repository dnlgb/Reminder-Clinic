import Sidebar from "./Sidebar";
import ClientList from "./ClientList";
import ClientForm from "./ClientForm";

function MainLaoyout(
    {clients, deleteClient, addClient}:
    {clients:{
        name: string; phone: string
    }[]
    deleteClient: (clientToDelete:{name: string; phone: string}) => void
    addClient: (newClient:{name: string; phone: string}) => void
}
){
return(
    <>
    <Sidebar/>
    <main>
        <ClientList clients = {clients}
        onDeleteClient={deleteClient}/>
        <ClientForm onAddClient={addClient}/>
    </main>
    </>
)
}export default MainLaoyout