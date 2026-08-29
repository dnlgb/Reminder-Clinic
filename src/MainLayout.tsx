import Sidebar from "./Sidebar";
import ClientList from "./ClientList";
import ClientForm from "./ClientForm";
import DashboardSummary from "./DashboardSummary";
import PendingCallbacks from "./PendingCallbacks";
import { Outlet } from "react-router-dom";

function MainLayout(
    /*{clients, deleteClient, addClient}:
    {clients:{
        name: string; phone: string
    }[]
    deleteClient: (clientToDelete:{name: string; phone: string}) => void
    addClient: (newClient:{name: string; phone: string}) => void
}*/
){
return(
    <>

    <div className="layout">
        <Sidebar />

        <main className="main-content">
        <Outlet />
        </main>
    </div>
    </>
)
}export default MainLayout