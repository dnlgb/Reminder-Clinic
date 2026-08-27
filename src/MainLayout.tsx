import Sidebar from "./Sidebar";
import ClientList from "./ClientList";
import ClientForm from "./ClientForm";
import DashboardSummary from "./DashboardSummary";

function MainLayout(
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

    <div className="layout">
        <Sidebar/>
        <main className="main-content">
            <DashboardSummary pending={clients.length}
            callbackT={clients.length}
            callbackComp={clients.length}/>
            <ClientList clients = {clients}
                onDeleteClient={deleteClient}/>
            <ClientForm onAddClient={addClient}/>
        </main>
    </div>
    </>
)
}export default MainLayout