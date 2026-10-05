import { Bell } from "@phosphor-icons/react";

export default function NotificationButton({
  unreadCount,
  onClick,
  isOpen,
}: {
  unreadCount: number;
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      className="notification-button"
      onClick={onClick}
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <Bell size={21} weight="regular" />
      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
