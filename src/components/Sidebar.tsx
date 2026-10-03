import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase";
import esthetixDentalSidebar from "../assets/esthetixDentalSidebar.png";
function Sidebar() {

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                    <img src={esthetixDentalSidebar}
                    alt="Esthetix Dental Spa"
                    className="sidebar-logo"
                    />
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

                    <button onClick={handleLogout}>
                        LogOut
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;