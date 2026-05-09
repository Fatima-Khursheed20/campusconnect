import LandingStatsBar from "../components/home/LandingStatsBar";
import Reveal from "../components/home/Reveal";

const VALUES = [
  {
    title: "Transparency",
    body: "Clear job expectations, timelines, and status updates so candidates and recruiters stay aligned.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ),
  },
  {
    title: "Opportunity",
    body: "Every student deserves access to vetted internships and graduate roles—not just networked referrals.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    ),
  },
  {
    title: "Growth",
    body: "We prioritize learning arcs: feedback loops from applications shape better postings and hires.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    title: "Community",
    body: "Built with campuses in mind—respect for academic calendars, mentorship, and diverse cohorts.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
];

const TEAM = [
  {
    name: "Fatima Khursheed",
    role: "Co-founder · Full-stack Lead",
    id: "23I-0746",
    initials: "FK",
  },
  {
    name: "Areeba Javed",
    role: "Co-founder · Product & Frontend",
    id: "23I-0570",
    initials: "AJ",
  },
  {
    name: "Campus Mentor Circle",
    role: "University partners & advisors",
    id: "Network",
    initials: "CM",
  },
];

export default function About() {
  return (
    <div className="-mx-4 bg-slate-50 sm:-mx-6">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-800 px-4 py-16 text-center sm:px-6 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute left-[-20%] top-0 h-96 w-96 rounded-full bg-white blur-[120px] animate-blob" />
          <div className="absolute bottom-[-30%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-indigo-400 blur-[100px] animate-blob animation-delay-300" />
        </div>
        <Reveal className="relative mx-auto max-w-4xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Our mission</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Bridge every classroom to careers that matter
          </h1>
          <p className="mt-6 text-lg text-indigo-100/95">
            CampusConnect exists so students ship real skills—not just resumes—and recruiters meet
            readiness, not buzzwords.
          </p>
        </Reveal>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal>
          <h2 className="text-3xl font-bold text-slate-900">Our story</h2>
        </Reveal>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                We started CampusConnect as a Web Programming capstone: too many spreadsheets, too little
                trust in who actually saw your application.
              </p>
              <p>
                Today the platform gives students a single place to browse, bookmark, and track
                applications—while recruiters manage postings and applicants with role-aware tools.
              </p>
              <p>
                We are still growing, but the north star is unchanged: fair access, fast feedback, and a
                hiring experience that respects students&apos; time.
              </p>
            </div>
          </Reveal>
          <Reveal delayClass="animation-delay-150">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-200 via-indigo-100 to-violet-200 shadow-lg">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-md backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Image placeholder
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Drop in a campus photo or team shot when assets are ready.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-20">
          <Reveal>
            <h2 className="text-center text-3xl font-bold text-slate-900">Our values</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              Principles that guide every feature we ship.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal
                key={v.title}
                delayClass={
                  i === 1 ? "animation-delay-150" : i === 2 ? "animation-delay-300" : i === 3 ? "animation-delay-450" : ""
                }
              >
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {v.icon}
                    </svg>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <Reveal>
            <h2 className="text-center text-3xl font-bold text-slate-900">Team</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              The people behind CampusConnect.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member, i) => (
              <Reveal
                key={member.name}
                delayClass={i === 1 ? "animation-delay-150" : i === 2 ? "animation-delay-300" : ""}
              >
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-md">
                    {member.initials}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{member.name}</h3>
                  <p className="mt-1 text-sm text-indigo-600">{member.role}</p>
                  <p className="mt-2 text-xs text-slate-500">{member.id}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <LandingStatsBar className="rounded-none" />
    </div>
  );
}
