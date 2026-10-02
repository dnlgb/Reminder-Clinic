import { useState } from "react";
import type { CallbackWithClient } from "../types";
import "../Styles/Callbacks.css"

function Callbacks({
    callbacks,
    callbacksLoading,
    callbacksError,
    handleSaveCallback,
}: {
    callbacks: CallbackWithClient[];
    callbacksLoading: boolean;
    callbacksError: string | null;

handleSaveCallback: (
    callback: CallbackWithClient,
    notes: string,
    callResult: "accepted" | "rescheduled" | "declined" | null,
    snoozeAt: string | null,
    rescheduleAt: string
) => Promise<boolean>;
}) 
{

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [isRescheduling, setIsRescheduling] = useState(false);
const [rescheduledAt, setRescheduledAt] = useState("");
const [customSnoozeHours, setCustomSnoozeHours] = useState("");
const [customSnoozeMinutes, setCustomSnoozeMinutes] = useState("");
const [isSnoozing, setIsSnoozing] = useState(false);
const [isCustomSnoozing, setIsCustomSnoozing] = useState(false);
const [callbackNotes, setCallbackNotes] = useState("");
const [selectedSnoozeOption, setSelectedSnoozeOption] =
    useState<"15m" | "1h" | "3h" | "custom" | null>(null);
const [saveMessage, setSaveMessage] = useState<string | null>(null);

const [selectedCallResult, setSelectedCallResult] =
    useState<"accepted" | "rescheduled" |"declined" | null>(null);
const [selectedSnoozeAt, setSelectedSnoozeAt] =
    useState<string | null>(null);
const [selectedRescheduleAt, setSelectedRescheduleAt] =
    useState("");

const [selectedCallback, setSelectedCallback] =
    useState<CallbackWithClient | null>(null);


  // HELPERS

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
// CB del mismo dia
const getDateKey = (date: Date) => {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");//une las fechas
};

    const getGroupDate = (dateString: string) => {
    const date = new Date(dateString);

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dateKey = getDateKey(date);
    const todayKey = getDateKey(today);
    const tomorrowKey = getDateKey(tomorrow);

    if (dateKey === todayKey) {
    return {
        title: "Today",
        subtitle: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
        })
    };
    }

    if (dateKey === tomorrowKey) {
    return {
        title: "Tomorrow",
        subtitle: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
        })
    };
    }

    return {
    title: date.toLocaleDateString("en-US", {
        weekday: "long"
    }),
    subtitle: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    })
    };
};


  // FILTER

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


  // GROUP BY DAY

const groupedCallbacks = filteredCallbacks.reduce<
    Record<string, CallbackWithClient[]> //obtiene objetos record<clave, valor>
    >((groups, callback) => { //group recorre array y va acumulando por vuelta cb es el elemnto "actual"
    //obtiene el dia
    const dateKey = getDateKey(
        new Date(callback.scheduled_at)
    );
    //pregunta si ya exite un grupo para x dia
    if (!groups[dateKey]) {
        groups[dateKey] = [];
    }
    //metemos el cb a su dia 
    groups[dateKey].push(callback);

    return groups; //se lleva el acumulador a la sig vuelta

}, {});

const callbackGroups = Object.entries(groupedCallbacks).sort(
    ([dateA], [dateB]) => {
    const todayKey = getDateKey(new Date());

    const dateAIsToday = dateA === todayKey;
    const dateBIsToday = dateB === todayKey;

    if (dateAIsToday) return -1;
    if (dateBIsToday) return 1;

    const now = new Date();
    const dateAObj = new Date(`${dateA}T00:00:00`);
    const dateBObj = new Date(`${dateB}T00:00:00`);
    const todayObj = new Date(`${todayKey}T00:00:00`);

    const dateAIsFuture = dateAObj > todayObj;
    const dateBIsFuture = dateBObj > todayObj;

    if (dateAIsFuture && dateBIsFuture) {
        return dateA.localeCompare(dateB);
    }

    if (!dateAIsFuture && !dateBIsFuture) {
        return dateB.localeCompare(dateA);
    }

    return dateAIsFuture ? -1 : 1;
    
}
);



return (
    <section className="callbacks-page">

      {/* HEADER */}
        <header className="callbacks-header">
        <div>
            <h1>Callbacks</h1>
            <p>Manage your scheduled callbacks.</p>
        </div>
    </header>

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

        <div className="callbacks-container">
        <div className="callbacks-list-header">
            <span>Client</span>
            <span>Scheduled</span>
            <span>Source</span>
            <span>Notes</span>
            <span>Status</span>
            <span></span>
        </div>

    {callbacksLoading ? (
        <div className="callback-empty">
            Loading callbacks...
        </div>
) : callbacksError ?(
    <div className="callback-empty">
        {callbacksError}
    </div>
) : filteredCallbacks.length === 0 ? (
    <div className="callback-empty">
        No callbacks found.
    </div>
) : (
    callbackGroups.map(([dateKey, dayCallbacks]) => {
        const groupDate = getGroupDate(dayCallbacks[0].scheduled_at);
        const sortedDayCallbacks = [...dayCallbacks].sort((a, b) => {
    const now = new Date();
    const dateA = new Date(a.scheduled_at);
    const dateB = new Date(b.scheduled_at);

    const todayKey = getDateKey(now);
    const dateAKey = getDateKey(dateA);
    const dateBKey = getDateKey(dateB);

        if (dateAKey === todayKey && dateBKey === todayKey) {
    const aPassed = dateA < now;
    const bPassed = dateB < now;

        if (aPassed && !bPassed) return 1;
        if (!aPassed && bPassed) return -1;
    }

    return dateA.getTime() - dateB.getTime();
});


    return (
        <div className="callback-date-group" key={dateKey}>
            <div className="callback-date-header">
                <div className="callback-date-title">
                    <strong>{groupDate.title}</strong>
                    <span>{groupDate.subtitle}</span>
                </div>

                <span className="callback-date-count">
                    {dayCallbacks.length}{" "}
                    {dayCallbacks.length === 1 ? "callback" : "callbacks"}
                </span>
            </div>


    {sortedDayCallbacks.map((callback) => {
        const client = callback.clientes;
    return (
        <div
            className="callback-row"
            key={callback.id}
            onClick={() => setSelectedCallback(callback)}>
            <div className="callback-client">
                <div className="callback-client-avatar">
                    {getInitials(client?.name ?? "—")}
                </div>

                <div className="callback-client-info">
                    <strong>{client?.name ?? "—"}</strong>
                    <span>{client?.phone ?? "—"}</span>
                </div>
            </div>

            <div className="callback-scheduled">
                <strong>{formatTime(callback.scheduled_at)}</strong>
                <span>{formatDate(callback.scheduled_at)}</span>
            </div>

            <div className="callback-source">
                <span className="callback-source-dot"></span>
                {client?.apps?.name ?? "—"}
            </div>

            <div className="callback-notes">
                {callback.notes
                    ? callback.notes.length > 30
                        ? `${callback.notes.slice(0, 30)}...`
                        : callback.notes
                    : "—"}
            </div>

            <span className="callback-status">
                {callback.status}
            </span>

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
    })}
        </div>//cbdategroup
    );})
)}
{saveMessage && (
    <div className="callback-save-toast">
        ✓ {saveMessage}
    </div>
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
    
    {!isRescheduling && !isSnoozing && (
    // Mostramos los botones solo si no estamos rescheduleando ni haciendo snooze
    <div className="callback-outcomes">
        {/* ACCEPTED */}
        <button
            className={
                selectedCallResult === "accepted"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                setSelectedCallResult("accepted");
                console.log("ACCEPTED CLICK");
                // Limpiamos cualquier otra acción pendiente
                setSelectedSnoozeAt(null);
                setSelectedSnoozeOption(null);
                setSelectedRescheduleAt("");
            }}
        >
            Accepted
        </button>


        {/* RESCHEDULE */}
        <button
            className={
                selectedCallResult === "rescheduled"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                setIsRescheduling(true);

                
                setSelectedCallResult(null);
                setSelectedSnoozeAt(null);
                setSelectedSnoozeOption(null);
                setSelectedRescheduleAt("");
            }}
        >
            Rescheduled
        </button>


        {/* SNOOZE */}
        <button
            className={
                selectedSnoozeAt
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                setIsSnoozing(true);

                
                setSelectedCallResult(null);
                setSelectedRescheduleAt("");
                setSelectedSnoozeAt(null);
                setSelectedSnoozeOption(null);
            }}
        >
            Snooze
        </button>


        {/* DECLINED */}
        <button
            className={
                selectedCallResult === "declined"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                setSelectedCallResult("declined");

                
                setSelectedSnoozeAt(null);
                setSelectedSnoozeOption(null);
                setSelectedRescheduleAt("");
            }}
        >
            Declined
        </button>

    </div>
)}


{/* SNOOZE */}
{isSnoozing && (
<div className="callback-outcomes">
<button
        type="button"
        onClick={() => {
            setIsSnoozing(false);
            setIsCustomSnoozing(false);
            setSelectedSnoozeAt(null);
            setSelectedSnoozeOption(null);
        }}
    >
    ← Back
</button>

        {/* 15 MIN */}
        <button
            className={
                selectedSnoozeOption === "15m"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                const reminderAt = new Date(
                    Date.now() + 15 * 60 * 1000
                ).toISOString();

                setSelectedSnoozeAt(reminderAt);
                setSelectedSnoozeOption("15m");
            }}
        >
            +15 min
        </button>


        {/* 1 HOUR */}
        <button
            className={
                selectedSnoozeOption === "1h"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                const reminderAt = new Date(
                    Date.now() + 60 * 60 * 1000
                ).toISOString();

                setSelectedSnoozeAt(reminderAt);
                setSelectedSnoozeOption("1h");
            }}
        >
            +1 hour
        </button>


        {/* 3 HOURS */}
        <button
            className={
                selectedSnoozeOption === "3h"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                if (!selectedCallback) return;

                const reminderAt = new Date(
                    Date.now() + 3 * 60 * 60 * 1000
                ).toISOString();

                setSelectedSnoozeAt(reminderAt);
                setSelectedSnoozeOption("3h");
            }}
        >
            +3 hours
        </button>


        {/* CUSTOM */}
        <button
            className={
                selectedSnoozeOption === "custom"
                    ? "selected"
                    : ""
            }
            onClick={() => {
                setIsCustomSnoozing(true);
                setCustomSnoozeHours("");
                setCustomSnoozeMinutes("");
                setSelectedSnoozeOption(null);
            }}
        >
            Custom snooze
        </button>

    </div>
)}


{/* CUSTOM SNOOZE */}
{isCustomSnoozing && (

    <div className="custom-snooze-duration">

        <input
            type="number"
            min="0"
            max="8"
            placeholder="0"
            value={customSnoozeHours}
            onChange={(event) =>
                setCustomSnoozeHours(event.target.value)
            }
        />

        <span>hours</span>


        <input
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={customSnoozeMinutes}
            onChange={(event) =>
                setCustomSnoozeMinutes(event.target.value)
            }
        />

        <span>minutes</span>


        {/* CANCEL */}
        <button
            onClick={() => {
                setIsCustomSnoozing(false);
                setCustomSnoozeHours("");
                setCustomSnoozeMinutes("");
            }}
        >
            Cancel
        </button>


        {/* SET REMINDER */}
        <button
            disabled={
                !customSnoozeHours &&
                !customSnoozeMinutes
            }
            onClick={() => {

                const hours =
                    Number(customSnoozeHours) || 0;

                const minutes =
                    Number(customSnoozeMinutes) || 0;

                const totalMinutes =
                    hours * 60 + minutes;


                // Máximo 8 horas
                if (
                    totalMinutes <= 0 ||
                    totalMinutes > 8 * 60
                ) {
                    return ;
                }


                const reminderAt = new Date(
                    Date.now() +
                    totalMinutes * 60 * 1000
                ).toISOString();


                setSelectedSnoozeAt(reminderAt);

                // Marcamos Custom como seleccionado
                setSelectedSnoozeOption("custom");

                setIsCustomSnoozing(false);
                setCustomSnoozeHours("");
                setCustomSnoozeMinutes("");
            }}
        >
            Set reminder
        </button>

    </div>
)}


{/* RESCHEDULE */}
{isRescheduling && (
<div>
    <button
            type="button"
            onClick={() => {
                setIsRescheduling(false);
                setRescheduledAt("");
                setSelectedRescheduleAt("");
                setSelectedCallResult(null);
            }}
        >
            ← Back
        </button>
        <input
            type="datetime-local"
            value={rescheduledAt}
            onChange={(event) =>
                setRescheduledAt(event.target.value)
            }
        />


        {/* CANCEL */}
        <button
            onClick={() => {
                setIsRescheduling(false);
                setRescheduledAt("");
            }}
        >
            Cancel
        </button>


        {/* RESCHEDULE */}
        <button
            disabled={!rescheduledAt}
            onClick={() => {

                if (!selectedCallback) return;
                console.log("RESCHEDULE BUTTON CLICK", {
            rescheduledAt
        });
                setSelectedRescheduleAt(
                    rescheduledAt
                );

                setSelectedCallResult(
                    "rescheduled"
                );

                setIsRescheduling(false);
            }}
        >
            Confirm reschedule
        </button>

    </div>
)}
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
        value={callbackNotes}
        onChange={(event) =>
                setCallbackNotes(event.target.value)
        }
    />
    </div>

    <div className="callback-panel-actions">
    <button
        className="callback-panel-cancel"
        onClick={() => setSelectedCallback(null)}
    >
        Cancel
    </button>

        <button className="callback-panel-save"
        onClick={async() => 
            
        {if(!selectedCallback)return;
            console.log("BEFORE SAVE:", {
            selectedCallResult,
            selectedSnoozeAt,
            selectedRescheduleAt
            });
        const saved = await handleSaveCallback(
            selectedCallback,
            callbackNotes,
            selectedCallResult,
            selectedSnoozeAt,
            selectedRescheduleAt
        );
        if (!saved) return;

            setSelectedCallback(null);

            setSelectedCallResult(null);
            setSelectedSnoozeAt(null);
            setSelectedSnoozeOption(null);
            setSelectedRescheduleAt("");
            setIsRescheduling(false);
            setIsSnoozing(false);
            setIsCustomSnoozing(false);

            setRescheduledAt("");
            setCustomSnoozeHours("");
            setCustomSnoozeMinutes("");
            setCallbackNotes("");

            setSaveMessage("Callback saved");

            setTimeout(() => {
                setSaveMessage(null);
            }, 2000);
    }}
        >
            Save callback
        </button>
    </div>

    </aside>
)}
    </section>
);
}

export default Callbacks