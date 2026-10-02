import type { ClientWithApp, CallbackWithClient } from "../types"
import "../styles/ClientDetails.css"

function ClientDetails({
    client,
    callbacks,
    onClose,
    onCallbackClient
}: {
    client: ClientWithApp
    callbacks: CallbackWithClient[]
    onClose: () => void
    onCallbackClient: (client: ClientWithApp) => void
}) {
    const clientCallbacks = callbacks
        .filter((callback) => callback.client_id === client.id)
        .sort(
            (a, b) =>
                new Date(b.scheduled_at).getTime() -
                new Date(a.scheduled_at).getTime()
        )

    const lastCallback = clientCallbacks[0]

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getTimeSince = (date: string) => {
        const difference =
            Date.now() - new Date(date).getTime()

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        )

        if (days === 0) {
            return "Today"
        }

        if (days === 1) {
            return "1 day ago"
        }

        return `${days} days ago`
    }

    return (
        
        <div className="client-details-overlay" onClick={onClose}>

            <div
                className="client-details-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="client-details-header">
                    <div>
                        <h2>Client details</h2>
                        <p>
                            {client.name}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="client-details-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="client-details-info">

                    <div>
                        <span>Name</span>
                        <strong>{client.name}</strong>
                    </div>

                    <div>
                        <span>Phone</span>
                        <strong>{client.phone}</strong>
                    </div>

                    <div>
                        <span>Source</span>
                        <strong>
                            {client.apps?.name ?? "Unknown"}
                        </strong>
                    </div>

                </div>

                <div className="client-details-summary">

                    <div>
                        <span>Last callback</span>

                        <strong>
                            {lastCallback
                                ? formatDate(
                                    lastCallback.scheduled_at
                                )
                                : "No callbacks"}
                        </strong>

                        {lastCallback && (
                            <small>
                                {getTimeSince(
                                    lastCallback.scheduled_at
                                )}
                            </small>
                        )}
                    </div>

                    <div>
                        <span>Total callbacks</span>

                        <strong>
                            {clientCallbacks.length}
                        </strong>
                    </div>

                </div>

                <div className="client-details-history">

                    <div className="client-details-history-header">
                        <h3>Callback history</h3>
                    </div>

                    {clientCallbacks.length === 0 ? (
                        <p className="client-details-empty">
                            No callbacks found.
                        </p>
                    ) : (
                        <div className="client-details-callbacks">

                            {clientCallbacks.map((callback) => (
                                <div
                                    className="client-details-callback"
                                    key={callback.id}
                                >

                                    <div>
                                        <strong>
                                            {formatDate(
                                                callback.scheduled_at
                                            )}
                                        </strong>

                                        <span>
                                            {formatTime(
                                                callback.scheduled_at
                                            )}
                                        </span>
                                    </div>

                                    <span
                                        className={`client-details-status status-${callback.call_result ?? callback.status}`}
                                    >
                                        {callback.call_result ??
                                            callback.status}
                                    </span>

                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </div>

        </div>
    )
}

export default ClientDetails