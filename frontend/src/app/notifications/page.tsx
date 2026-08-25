import Link from "next/link";

const notifications = [
  {
    id: 1,
    title: "Match starting soon",
    message: "Your BGMI Squad Championship match starts at 8:00 PM.",
    time: "10 min ago",
    type: "match",
    unread: true,
  },
  {
    id: 2,
    title: "Room details available",
    message: "Room ID and password for your match are now available.",
    time: "1 hour ago",
    type: "room",
    unread: true,
  },
  {
    id: 3,
    title: "Tournament registration successful",
    message: "You successfully joined BGMI Squad Championship.",
    time: "Yesterday",
    type: "success",
    unread: false,
  },
  {
    id: 4,
    title: "Tournament result published",
    message: "The results for BGMI Solo Battle are now available.",
    time: "2 days ago",
    type: "result",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}

      <section className="border-b border-zinc-800">

        <div className="mx-auto max-w-4xl px-5 py-10">

          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← Home
          </Link>

          <div className="mt-5 flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-black">
                Notifications
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Stay updated with your tournaments and matches.
              </p>
            </div>

            <button
              type="button"
              className="hidden text-sm font-semibold text-orange-500 hover:text-orange-400 sm:block"
            >
              Mark all as read
            </button>

          </div>

        </div>

      </section>


      {/* Notifications */}

      <section className="mx-auto max-w-4xl px-5 py-8">

        <div className="space-y-3">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className={`rounded-2xl border p-5 ${
                notification.unread
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >

              <div className="flex gap-4">

                {/* Icon */}

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-lg">

                  {notification.type === "match" && "🎮"}

                  {notification.type === "room" && "🔐"}

                  {notification.type === "success" && "✅"}

                  {notification.type === "result" && "🏆"}

                </div>


                {/* Content */}

                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <h2 className="font-bold">
                      {notification.title}
                    </h2>

                    <span className="text-xs text-zinc-600">
                      {notification.time}
                    </span>

                  </div>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {notification.message}
                  </p>

                </div>


                {/* Unread */}

                {notification.unread && (
                  <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                )}

              </div>

            </div>

          ))}

        </div>


        {/* Empty state example */}

        {notifications.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

            <div className="text-4xl">
              🔔
            </div>

            <h2 className="mt-4 font-bold">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              You're all caught up.
            </p>

          </div>
        )}

      </section>

    </main>
  );
}