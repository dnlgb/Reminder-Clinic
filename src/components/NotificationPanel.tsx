import { Bell } from "@phosphor-icons/react";
import type { Notification } from "../types";

export default function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="notification-panel" role="dialog" aria-label="Notifications">
      <div className="notification-panel-header">
        <div>
          <h3>Notifications</h3>
          <span>{unreadCount ? `${unreadCount} unread` : "No new notifications"}</span>
        </div>
        <button type="button" onClick={onMarkAllAsRead} disabled={!unreadCount}>
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-panel-empty">
          <Bell size={26} weight="light" />
          <strong>No notifications yet</strong>
          <span>You're all caught up.</span>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <article
              className={`notification-item${notification.read_at ? " is-read" : " is-unread"}`}
              key={notification.id}
            >
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <time dateTime={notification.created_at}>
                  {new Date(notification.created_at).toLocaleString()}
                </time>
              </div>
              {!notification.read_at && (
                <button type="button" onClick={() => onMarkAsRead(notification.id)}>
                  Mark as read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
