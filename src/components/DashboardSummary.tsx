import { useEffect, useRef, useState } from "react"
import type { CallbackWithClient } from "../types"
import "../styles/Home.css"
import { CalendarDots } from "@phosphor-icons/react"
import NotificationButton from "./NotificationButton"
import NotificationPanel from "./NotificationPanel"
import type { Notification } from "../types"


function DashboardSummary({
    callbacks,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
}: {
    callbacks: CallbackWithClient[]
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
    markAllAsRead: () => void
}) {
    const [now, setNow] = useState(new Date())
    const [notificationsOpen, setNotificationsOpen] = useState(false)

    const timelineRef = useRef<HTMLDivElement | null>(null)
    const activeCallbackRef = useRef<HTMLDivElement | null>(null)

    // actualiza la hora del dashboard cada minuto
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date())
        }, 60_000)

        return () => clearInterval(interval)
    }, [])

    // saludo según la hora actual
    const hour = now.getHours()

    const greeting =
        hour >= 5 && hour < 12
            ? "Good morning"
            : hour >= 12 && hour < 18
                ? "Good afternoon"
                : "Good evening"

    // filtra solo los callbacks de hoy
    const todayCallbacks = callbacks.filter((callback) => {
        if (callback.status === "cancelled") return false

        const callbackDate = new Date(callback.scheduled_at)

        return (
            callbackDate.getFullYear() === now.getFullYear() &&
            callbackDate.getMonth() === now.getMonth() &&
            callbackDate.getDate() === now.getDate()
        )
    })

    // callbacks que ya fueron respondidos
    const respondedCallbacks = todayCallbacks
        .filter(
            (callback) =>
                callback.call_result === "accepted" ||
                callback.call_result === "declined" ||
                callback.call_result === "rescheduled"
        )
        .sort(
            (a, b) =>
                new Date(b.scheduled_at).getTime() -
                new Date(a.scheduled_at).getTime()
        )

    // callbacks que siguen pendientes
    const pendingCallbacks = todayCallbacks.filter(
        (callback) => callback.status === "pending"
    )

    // busca el callback pendiente más reciente cuya hora ya pasó
    // si no existe, toma el próximo callback pendiente
    const activeCallback =
        pendingCallbacks
            .filter(
                (callback) =>
                    new Date(callback.scheduled_at).getTime() <=
                    now.getTime()
            )
            .sort(
                (a, b) =>
                    new Date(b.scheduled_at).getTime() -
                    new Date(a.scheduled_at).getTime()
            )[0] ??
        pendingCallbacks
            .filter(
                (callback) =>
                    new Date(callback.scheduled_at).getTime() >
                    now.getTime()
            )
            .sort(
                (a, b) =>
                    new Date(a.scheduled_at).getTime() -
                    new Date(b.scheduled_at).getTime()
            )[0]

    // callbacks pendientes que no son el activo
    const upcomingCallbacks = pendingCallbacks
        .filter((callback) => callback.id !== activeCallback?.id)
        .sort(
            (a, b) =>
                new Date(a.scheduled_at).getTime() -
                new Date(b.scheduled_at).getTime()
        )

    // el primero de upcoming es el siguiente callback
    const nextCallbackId = upcomingCallbacks[0]?.id

    // calcula las estadísticas una sola vez
    const acceptedCount = todayCallbacks.filter(
        (callback) => callback.call_result === "accepted"
    ).length

    const rescheduledCount = todayCallbacks.filter(
        (callback) => callback.call_result === "rescheduled"
    ).length

    const declinedCount = todayCallbacks.filter(
        (callback) => callback.call_result === "declined"
    ).length

    const completedCount = todayCallbacks.filter(
        (callback) => callback.status === "completed"
    ).length

    // centra el callback activo dentro del timeline
    useEffect(() => {
        if (!timelineRef.current || !activeCallbackRef.current) return

        const timeline = timelineRef.current
        const activeElement = activeCallbackRef.current

        const scrollPosition =
            activeElement.offsetTop -
            timeline.clientHeight / 2 +
            activeElement.clientHeight / 2

        timeline.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth"
        })
    }, [activeCallback?.id])

    // convierte la fecha del callback a una hora legible
    const formatTime = (scheduledAt: string) => {
        return new Date(scheduledAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <>
            <section className="dashboard-header">
            <h2>{greeting}</h2>
            <p>Here's what needs your attention today.</p>
            <div className="dashboard-notifications">
                <NotificationButton
                    unreadCount={unreadCount}
                    isOpen={notificationsOpen}
                    onClick={() => setNotificationsOpen((open) => !open)}
                />
                {notificationsOpen && (
                    <NotificationPanel
                        notifications={notifications}
                        onMarkAsRead={(id) => void markAsRead(id)}
                        onMarkAllAsRead={() => void markAllAsRead()}
                    />
                )}
            </div>
        </section>

        <section className="dashboard-main">

            <section className="today-callbacks">
                <h2>Today's callbacks</h2>

                <div
                    className={`callback-timeline ${
                        respondedCallbacks.length === 0 &&
                        !activeCallback &&
                        upcomingCallbacks.length === 0
                            ? "callback-timeline-empty"
                            : ""
                    }`}
                    ref={timelineRef}
                >

                    {respondedCallbacks.length === 0 &&
                    !activeCallback &&
                    upcomingCallbacks.length === 0 ? (
                        <div className="empty-callbacks">
                            <CalendarDots
                                size={28}
                                weight="light"
                            />

                            <strong>
                                No callbacks scheduled
                            </strong>

                            <span>
                                You're all clear for today.
                            </span>
                        </div>
                    ) : (
                        <>
                            {respondedCallbacks.map((callback) => (
                                <div
                                    className="timeline-item timeline-item-past"
                                    key={callback.id}
                                >
                                    <span>
                                        {formatTime(
                                            callback.scheduled_at
                                        )}
                                    </span>

                                    <div className="timeline-dot"></div>

                                    <div className="timeline-content">
                                        <strong>
                                            {callback.clientes?.name}
                                        </strong>

                                        <span className="callback-status">
                                            {callback.status}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {activeCallback && (
                                <div
                                    className="timeline-item timeline-item-active"
                                    key={activeCallback.id}
                                    ref={activeCallbackRef}
                                >
                                    <span>
                                        {formatTime(
                                            activeCallback.scheduled_at
                                        )}
                                    </span>

                                    <div className="timeline-dot"></div>

                                    <div className="timeline-content">
                                        <strong>
                                            {activeCallback.clientes?.name}
                                        </strong>

                                        <span className="callback-status">
                                            {activeCallback.status}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {upcomingCallbacks.map((callback) => (
                                <div
                                    className={`timeline-item timeline-item-upcoming ${
                                        callback.id === nextCallbackId
                                            ? "timeline-item-next"
                                            : ""
                                    }`}
                                    key={callback.id}
                                >
                                    <span>
                                        {formatTime(
                                            callback.scheduled_at
                                        )}
                                    </span>

                                    <div className="timeline-dot"></div>

                                    <div className="timeline-content">
                                        <strong>
                                            {callback.clientes?.name}
                                        </strong>

                                        <span className="callback-status">
                                            {callback.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                </div>
            </section>

            <aside className="dashboard-side">

                <div className="daily-workflow">
                    <h2>Daily workflow</h2>

                    <span>
                        Results from completed callbacks
                    </span>

                    <div className="workflow-result">

                        <div className="workflow-row">
                            <div className="workflow-label">
                                <strong>Accepted</strong>

                                <div className="workflow-dots">
                                    {Array.from({
                                        length: Math.min(
                                            acceptedCount,
                                            4
                                        )
                                    }).map((_, index) => (
                                        <span
                                            className="accepted-dot"
                                            key={index}
                                        ></span>
                                    ))}
                                </div>
                            </div>

                            <span className="workflow-count">
                                {acceptedCount}
                            </span>
                        </div>

                        <div className="workflow-row">
                            <div className="workflow-label">
                                <strong>Rescheduled</strong>

                                <div className="workflow-dots">
                                    {Array.from({
                                        length: Math.min(
                                            rescheduledCount,
                                            4
                                        )
                                    }).map((_, index) => (
                                        <span
                                            className="rescheduled-dot"
                                            key={index}
                                        ></span>
                                    ))}
                                </div>
                            </div>

                            <span className="workflow-count">
                                {rescheduledCount}
                            </span>
                        </div>

                        <div className="workflow-row">
                            <div className="workflow-label">
                                <strong>Declined</strong>

                                <div className="workflow-dots">
                                    {Array.from({
                                        length: Math.min(
                                            declinedCount,
                                            4
                                        )
                                    }).map((_, index) => (
                                        <span
                                            className="declined-dot"
                                            key={index}
                                        ></span>
                                    ))}
                                </div>
                            </div>

                            <span className="workflow-count">
                                {declinedCount}
                            </span>
                        </div>

                    </div>
                </div>

                <div className="today-overview">
                    <h2>Today's overview</h2>

                    <div className="overview-stats">

                        <div>
                            <strong>
                                {todayCallbacks.length}
                            </strong>

                            <span>
                                Total callbacks today
                            </span>
                        </div>

                        <div>
                            <strong>
                                {completedCount}
                            </strong>

                            <span>
                                Completed
                            </span>
                        </div>

                    </div>
                </div>

            </aside>

        </section>
        </>
    )
}

export default DashboardSummary
