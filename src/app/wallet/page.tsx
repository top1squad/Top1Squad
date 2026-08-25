import Link from "next/link";

const transactions = [
  {
    id: 1,
    title: "Tournament Entry",
    tournament: "BGMI Squad Championship",
    amount: "-₹50",
    date: "10 Aug 2026",
    status: "Paid",
  },
  {
    id: 2,
    title: "Tournament Winning",
    tournament: "BGMI Solo Battle",
    amount: "+₹500",
    date: "08 Aug 2026",
    status: "Received",
  },
  {
    id: 3,
    title: "Wallet Added",
    tournament: "Razorpay",
    amount: "+₹200",
    date: "05 Aug 2026",
    status: "Added",
  },
];

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}

      <section className="border-b border-zinc-800">

        <div className="mx-auto max-w-6xl px-5 py-10">

          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← Home
          </Link>

          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            Wallet
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage your tournament balance and transactions.
          </p>

        </div>

      </section>


      {/* Wallet */}

      <section className="mx-auto max-w-6xl px-5 py-8">

        {/* Balance Card */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">

          <p className="text-sm text-zinc-500">
            Available Balance
          </p>

          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-4xl font-black">
                ₹650
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Available for tournament entries
              </p>

            </div>


            {/* Add Money */}

            <button
              type="button"
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
            >
              + Add Money
            </button>

          </div>

        </div>


        {/* Stats */}

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

            <p className="text-sm text-zinc-500">
              Total Added
            </p>

            <p className="mt-2 text-xl font-black">
              ₹200
            </p>

          </div>


          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

            <p className="text-sm text-zinc-500">
              Total Winnings
            </p>

            <p className="mt-2 text-xl font-black text-green-500">
              ₹500
            </p>

          </div>


          <div className="col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:col-span-1">

            <p className="text-sm text-zinc-500">
              Tournament Entries
            </p>

            <p className="mt-2 text-xl font-black">
              ₹50
            </p>

          </div>

        </div>


        {/* Transactions */}

        <div className="mt-10">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-black">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your recent wallet activity.
              </p>

            </div>

          </div>


          <div className="mt-5 space-y-3">

            {transactions.map((transaction) => (

              <div
                key={transaction.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                      {transaction.amount.startsWith("+")
                        ? "↓"
                        : "↑"}
                    </div>

                    <div>

                      <h3 className="font-bold">
                        {transaction.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600">
                        {transaction.tournament}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {transaction.date}
                      </p>

                    </div>

                  </div>


                  <div className="text-right">

                    <p
                      className={`font-bold ${
                        transaction.amount.startsWith("+")
                          ? "text-green-500"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.amount}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {transaction.status}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* Payment Info */}

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">

          <div className="flex gap-4">

            <div className="text-2xl">
              🔒
            </div>

            <div>

              <h3 className="font-bold">
                Secure Payments
              </h3>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Payments will be processed securely through
                Razorpay when the payment system is connected.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
