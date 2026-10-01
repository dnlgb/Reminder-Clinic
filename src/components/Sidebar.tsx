import { data, NavLink } from "react-router-dom"
import { supabase } from "../lib/supabase";

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
                <span>DG</span>
                <div>
                    <strong>Daniel</strong>
                    <small>Care Coordinator</small>
                    <button onClick={() => supabase.auth.signOut()}>
                    LogOut
                </button>
                </div>
            </div>

            
        </aside>
    )
}export default Sidebar