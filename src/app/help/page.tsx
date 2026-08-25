import Link from "next/link";

const faqs = [
  {
    question: "How do I join a tournament?",
    answer:
      "Open the Tournaments page, select a tournament, and click Join Tournament. Complete your team details and pay the entry fee.",
  },
  {
    question: "How do I get the Room ID?",
    answer:
      "The Room ID and password will be shown in My Matches when the tournament organizer releases the room details.",
  },
  {
    question: "Can I get a refund after joining?",
    answer:
      "Refunds depend on the tournament rules. Check the tournament details before making your payment.",
  },
  {
    question: "Which games are supported?",
    answer:
      "Tournament Arena currently supports BGMI and Free Fire tournaments.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}

      <section className="border-b border-zinc-800">

        <div className="mx-auto max-w-4xl px-5 py-8">

          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← Home
          </Link>

          <h1 className="mt-5 text-3xl font-black">
            Help & Support
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Need help? Find answers or contact our support team.
          </p>

        </div>

      </section>


      {/* Content */}

      <section className="mx-auto max-w-4xl px-5 py-8">

        {/* Contact Support */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

          <h2 className="text-xl font-black">
            Contact Support
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            If you are facing a problem with a tournament,
            payment, registration, or account, contact us.
          </p>


          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="text-2xl">
                📧
              </div>

              <h3 className="mt-3 font-bold">
                Email Support
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                support@tournamentarena.com
              </p>

            </div>


            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="text-2xl">
                💬
              </div>

              <h3 className="mt-3 font-bold">
                Live Support
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Available during tournament hours.
              </p>

              <button
                type="button"
                className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-400"
              >
                Contact Support
              </button>

            </div>

          </div>

        </div>


        {/* FAQ */}

        <div className="mt-6">

          <h2 className="text-xl font-black">
            Frequently Asked Questions
          </h2>

          <div className="mt-4 space-y-3">

            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-zinc-800 bg-zinc-900"
              >

                <summary className="cursor-pointer list-none px-5 py-4 font-bold">

                  <div className="flex items-center justify-between">

                    <span>
                      {faq.question}
                    </span>

                    <span className="text-zinc-500 transition group-open:rotate-180">
                      ↓
                    </span>

                  </div>

                </summary>

                <div className="border-t border-zinc-800 px-5 py-4 text-sm leading-6 text-zinc-500">
                  {faq.answer}
                </div>

              </details>
            ))}

          </div>

        </div>


        {/* Quick Links */}

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

          <h2 className="text-xl font-black">
            Quick Links
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <Link
              href="/tournaments"
              className="rounded-xl border border-zinc-800 px-5 py-4 font-semibold hover:border-orange-500 hover:text-orange-500"
            >
              🎮 Browse Tournaments
            </Link>

            <Link
              href="/my-matches"
              className="rounded-xl border border-zinc-800 px-5 py-4 font-semibold hover:border-orange-500 hover:text-orange-500"
            >
              🏆 My Matches
            </Link>

            <Link
              href="/notifications"
              className="rounded-xl border border-zinc-800 px-5 py-4 font-semibold hover:border-orange-500 hover:text-orange-500"
            >
              🔔 Notifications
            </Link>

            <Link
              href="/settings"
              className="rounded-xl border border-zinc-800 px-5 py-4 font-semibold hover:border-orange-500 hover:text-orange-500"
            >
              ⚙ Settings
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}