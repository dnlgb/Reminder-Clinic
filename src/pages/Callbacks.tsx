import { useState } from "react";
import type { CallbackWithClient } from "../types";
import "./Callbacks.css";

function Callbacks({
    callbacks,
    handleCancel,
    handleCompleteCallback
}: {
    callbacks: CallbackWithClient[];
    handleCancel: (callback: CallbackWithClient) => void;
    handleCompleteCallback: (
        callback: CallbackWithClient, 
        callResult: "accepted" | "declined"
    )=> void;
}) {

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

const [selectedCallback, setSelectedCallback] = 
    useState<CallbackWithClient |null>(null);

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
//devuelve los callbacksclientes
return (
        <div
            className="callback-row"
            key={callback.id}
            onClick={() =>setSelectedCallback(callback)}

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

                    <span>
                        {client?.apps?.name ?? "—"}
                    </span>

                </div>

                {/* STATUS */}
                <span className="callback-status">
                    {callback.status}
                </span>

                {/* ACTION */}
                <div className="callback-actions">

                <button
                className="callback-menu-button"
                onClick={(e) => {
                e.stopPropagation();
                setSelectedCallback(callback);
                }}
                title="Open callback"
                >
                ⋯
                </button>

                </div>

            </div>
            );
        })

        )}

    </div>
        {selectedCallback && (
    <aside className="callback-panel">

    <div className="callback-panel-header">
        <div>
            <span className="callback-panel-label">
            Callback
            </span>

        <h2>
            {selectedCallback.clientes?.name ?? "Unknown client"}
        </h2>
    </div>

    <button
        className="callback-panel-close"
        onClick={() => setSelectedCallback(null)}
        >
            ×
    </button>
    </div>

    <div className="callback-panel-client">
        <span>
            {selectedCallback.clientes?.phone ?? "No phone"}
        </span>

        <span>
            {formatDate(selectedCallback.scheduled_at)} ·{" "}
            {formatTime(selectedCallback.scheduled_at)}
        </span>
    </div>

    <div className="callback-panel-section">
        <span className="callback-panel-section-title">
            Call outcome
        </span>

    <div className="callback-outcomes">

        <button
        onClick={() =>{
            if(!selectedCallback) return;
            
            handleCompleteCallback(selectedCallback, "accepted")
            console.log(selectedCallback)
            }}>
            Accepted
        </button>

        <button>
            Rescheduled
        </button>

        <button>
            Snooze
        </button>

        <button
            onClick={() =>{
            if(!selectedCallback) return;
            handleCompleteCallback(selectedCallback, "declined")}}>
            Declined
        </button>

    </div>
    </div>

    <div className="callback-panel-section">
    <label
        className="callback-panel-section-title"
        htmlFor="callback-notes"
    >
        Notes
    </label>

    <textarea
        id="callback-notes"
        placeholder="Add notes about the call..."
        defaultValue={selectedCallback.notes ?? ""}
    />
    </div>

    <div className="callback-panel-actions">
    <button
        className="callback-panel-cancel"
        onClick={() => setSelectedCallback(null)}
    >
        Cancel
    </button>

        <button className="callback-panel-save">
            Save callback
        </button>
    </div>

    </aside>
)}
    </section>
);
}

export default Callbacks;