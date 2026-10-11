const highlights = [
  {
    number: "200",
    title: "TOPICS",
    description: "from 20 Medical Branches",
  },
  {
    number: "1000+",
    title: "HIGH-YIELD",
    description: "Mnemonics & Memory Tips",
  },
  {
    number: "PERFECT FOR",
    title: "",
    description: "Various University & Competitive Exams",
  },
  {
    number: "EXAM-FOCUSED",
    title: "",
    description: "Quick Revision, Easy Recall, Better Retention",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold tracking-widest text-green-700">
              BHARATI BOOK STALL
            </p>
            <h1 className="text-lg font-bold text-blue-950">
              Medical Books & Resources
            </h1>
          </div>

          <div className="text-sm text-slate-600">Secure Online Purchase</div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
          {/* Cover */}
          <div className="flex justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200">
              <img
                src="/images/book-cover.png"
                alt="All-in-One Quick Medical Review book cover"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Book information */}
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              2025 Edition
            </p>

            <h2 className="text-4xl font-extrabold leading-tight text-blue-950 sm:text-5xl">
              All-in-One Quick
              <br />
              <span className="text-blue-700">Medical Review</span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              A quick-revision medical review book designed for nurses, medical
              and paramedical students, with high-yield topics, mnemonics and
              exam-focused revision.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Authors
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                Dr. Debjit Sarkar · Dr. Subir Dutta · Poli Paul · Mahananda Paul
              </p>
            </div>

            {/* Purchase options */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  PAPERBACK
                </p>

                <p className="mt-2 text-3xl font-extrabold text-blue-950">
                  ₹199
                </p>

                <p className="mt-1 text-sm text-slate-500">Physical book</p>

                <button className="mt-5 w-full rounded-xl bg-blue-800 px-5 py-3 font-bold text-white transition hover:bg-blue-900">
                  Buy Paperback
                </button>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-green-700">PDF</p>

                <p className="mt-2 text-3xl font-extrabold text-blue-950">
                  ₹99
                </p>

                <p className="mt-1 text-sm text-slate-500">Digital edition</p>

                <button className="mt-5 w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800">
                  Buy PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Whats inside
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-blue-950">
              One Book. Every Topic.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.number}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <p className="text-2xl font-extrabold text-green-700">
                  {item.number}
                </p>

                {item.title && (
                  <p className="mt-1 font-bold text-blue-950">{item.title}</p>
                )}

                <p className="mt-2 leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="bg-blue-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
            Suitable for
          </p>

          <h2 className="mt-3 text-3xl font-extrabold">
            Students & Competitive Exams
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "MBBS",
              "B.Sc. Nursing",
              "A.N.M.",
              "G.N.M.",
              "Paramedical",
              "Pharmacist",
              "AYUSH",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-800 bg-blue-900 px-5 py-2 text-sm font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="font-bold text-blue-950">Bharati Book Stall</p>
          <p className="mt-1 text-sm text-slate-500">
            Trusted by Students. Recommended by Educators.
          </p>
        </div>
      </footer>
    </main>
  );
}
