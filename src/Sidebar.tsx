import { Link } from "react-router-dom"

function Sidebar() {
    return(
        <aside className="sidebar">
            <div>
            <h2>Callback Clinic</h2>
            <nav className="sidebar-nav">
                <Link to="/">Dashboard</Link>
                <Link to="/clients">Clients</Link>
                <Link to="/callbacks">Callbacks</Link>
            </nav>
            </div>
            <div>
                <a href="" className="sidebar-user">User</a>
            </div>
            
        </aside>
    )
}export default Sidebar