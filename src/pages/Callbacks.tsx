import { useState } from "react";
import type { CallbackWithClient } from "../types";
import "./Callbacks.css";

function Callbacks({
    callbacks,
    handleCancel
}: {
    callbacks: CallbackWithClient[];
    handleCancel: (callback: CallbackWithClient) => void;
}) {

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredCallbacks = callbacks.filter((callback) => {

    const clientName = callback.clientes?.name ?? "";
    const clientPhone = callback.clientes?.phone ?? "";

    const matchesSearch =
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        clientPhone.includes(search);

    const matchesStatus =
        statusFilter === "all" ||
        callback.status === statusFilter;

    return matchesSearch && matchesStatus;
});

const getInitials = (name: string) => {
    return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short"
    });
};

const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
    });
};

return (
    <section className="callbacks-page">

      {/* HEADER */}
        <header className="callbacks-header">
        <div>
            <h1>Callbacks</h1>
            <p>Manage your scheduled callbacks.</p>
        </div>
    </header>

      {/* TOOLBAR */}
    <div className="callbacks-toolbar">

        <div className="callbacks-search">
            <input
                type="text"
                placeholder="Search by client name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
        />
        </div>

        <select
            className="callbacks-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
        >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
        </select>

    </div>

      {/* CALLBACKS */}
        <div className="callbacks-container">

        {/* LIST HEADER */}
        <div className="callbacks-list-header">
            <span>Client</span>
            <span>Scheduled</span>
            <span>Source</span>
            <span>Status</span>
            <span></span>
        </div>

        {filteredCallbacks.length === 0 ? (

            <div className="callback-empty">
                No callbacks found.
            </div>

        ) : (

        filteredCallbacks.map((callback) => {

            const client = callback.clientes;

return (
        <div
            className="callback-row"
            key={callback.id}
            >

                {/* CLIENT */}
                <div className="callback-client">

                <div className="callback-client-avatar">
                    {client
                    ? getInitials(client.name)
                    : "?"}
                </div>

                <div className="callback-client-info">

                    <strong>
                        {client?.name ?? "Unknown client"}
                    </strong>

                    <span>
                        {client?.phone ?? "No phone"}
                    </span>

                </div>

                </div>

                {/* SCHEDULED */}
                <div className="callback-scheduled">

                <strong>
                    {formatDate(callback.scheduled_at)}
                </strong>

                <span>
                    {formatTime(callback.scheduled_at)}
                </span>

                </div>

                {/* SOURCE */}
                <div className="callback-source">

                <span className="callback-source-dot"></span>

                <span>—</span>

                </div>

                {/* STATUS */}
                <span className="callback-status">
                    {callback.status}
                </span>

                {/* ACTION */}
                <div className="callback-actions">

                <button
                    className="callback-menu-button"
                    onClick={() => handleCancel(callback)}
                    title="Cancel callback"
                >
                    ⋯
                </button>

                </div>

            </div>
            );
        })

        )}

    </div>

    </section>
);
}

export default Callbacks;