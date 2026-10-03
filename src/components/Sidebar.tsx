import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase";
import esthetixDentalSidebar from "../assets/esthetixDentalSidebar.png";
import { useEffect, useState } from "react";
import { Blobatar } from "@blobatar/react"
import {
    House,
    CalendarDots,
    UsersThree,
} from "@phosphor-icons/react"
function Sidebar() {

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error signing out:", error);
        }
    };
    const [userName, setUserName] = useState("");
    useEffect(() => {
    const getUserProfile = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("usuarios")
            .select("name")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error getting user profile:", error);
            return;
        }

        setUserName(data.name);
    };

    getUserProfile();
}, []);

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                    <img src={esthetixDentalSidebar}
                    alt="Esthetix Dental Spa"
                    className="sidebar-logo"
                    />
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/">
                    <House size={20} weight="regular" />
                    <span>Home</span>
                </NavLink>

                <NavLink to="/clients">
                    <UsersThree size={20} weight="regular" />
                    <span>Clients</span>
                </NavLink>

                <NavLink to="/callbacks">
                    <CalendarDots size={20} weight="regular" />
                    <span>Callbacks</span>
                </NavLink>
            </nav>

            <div className="sidebar-user">
                <Blobatar
                    name={userName}
                    size={50}
                />

                <div>
                    <strong>{userName}</strong>

                    <button onClick={handleLogout}>
                        LogOut
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;