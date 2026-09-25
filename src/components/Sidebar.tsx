import { NavLink } from "react-router-dom"

function Sidebar() {
    return(
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    ↪
                </div>

                <h2>Callback Clinic</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/clients">Clients</NavLink>
                <NavLink to="/callbacks">Callbacks</NavLink>
            </nav>

            <div className="sidebar-user">
                <span>EV</span>
                <div>
                    <strong>Dr. Elena Vance</strong>
                    <small>Care Coordinator</small>
                </div>
            </div>

            
        </aside>
    )
}export default Sidebar