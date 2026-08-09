import { useState } from "react";

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function NotificationBell({ notifications, onOpenNotification }) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-pill relative flex h-10 w-10 items-center justify-center rounded-full text-lg"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="glass-strong absolute right-0 z-40 mt-2 max-h-96 w-80 overflow-y-auto rounded-3xl p-3">
            <p className="px-2 py-1 text-xs font-black text-slate-400">알림</p>
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-400">아직 알림이 없어요.</p>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenNotification(notif);
                    }}
                    className={`block w-full rounded-2xl px-3 py-3 text-left transition hover:bg-white/60 ${
                      notif.is_read ? "" : "bg-[#1B1F4D]/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-slate-900">{notif.title}</p>
                      {!notif.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#0a84ff]" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{notif.body}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-400">{timeAgo(notif.created_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
