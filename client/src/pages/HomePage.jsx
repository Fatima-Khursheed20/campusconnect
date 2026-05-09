import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import LandingStatsBar from "../components/home/LandingStatsBar";
import Reveal from "../components/home/Reveal";
import { getTypeBadgeClasses, companyInitials } from "../utils/jobDisplay";

const TESTIMONIALS = [
  {
    name: "Sara Ahmed",
    university: "NUST",
    quote:
      "CampusConnect made internship applications feel organized. I shortlisted three offers and landed a summer role within weeks.",
    initials: "SA",
  },
  {
    name: "Hassan Malik",
    university: "FAST",
    quote:
      "The job cards are clear and Apply is one click from the listing. Recruiters actually responded through the platform.",
    initials: "HM",
  },
  {
    name: "Aisha Khan",
    university: "IBA",
    quote:
      "As a career switcher, Browse Jobs + bookmarks helped me track every application without messy spreadsheets.",
    initials: "AK",
  },
];

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full max-w-[75%] rounded bg-slate-200" />
              <div className="h-3 w-full max-w-[55%] rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-10 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [heroLocation, setHeroLocation] = useState("");
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFeaturedLoading(true);
        const { data } = await api.get("/jobs?page=1&limit=6");
        if (!cancelled) {
          setFeatured(data.jobs || []);
          setFeaturedError(null);
        }
      } catch (e) {
        if (!cancelled) setFeaturedError(e.response?.data?.message || "Could not load featured jobs");
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const loc = heroLocation.trim();
    if (loc) params.set("location", loc);
    navigate(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="bg-slate-50">
      {/* —— Hero —— */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:pt-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-[-10%] top-[10%] h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div className="absolute right-[-5%] top-[30%] h-80 w-80 rounded-full bg-purple-300/20 blur-3xl animate-blob animation-delay-300" />
          <div className="absolute bottom-[-15%] left-[25%] h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl animate-blob animation-delay-600" />
          <div className="absolute right-[20%] top-[8%] h-24 w-24 rounded-2xl bg-white/15 backdrop-blur animate-float" />
          <div className="absolute left-[18%] bottom-[25%] h-16 w-16 rounded-full bg-white/10 animate-float-slow animation-delay-450" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="animate-fadeInUp text-sm font-semibold uppercase tracking-wide text-indigo-100">
              Built for campus hiring
            </p>
            <h1 className="animate-fadeInUp animation-delay-150 mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Dream Internship
            </h1>
            <p className="animate-fadeInUp animation-delay-300 mt-5 text-lg text-indigo-100/95 sm:text-xl">
              CampusConnect connects students with recruiters posting real internships and roles—clear
              listings, simple applications, and less noise.
            </p>
          </div>

          <form
            onSubmit={onHeroSearch}
            className="animate-fadeInUp animation-delay-450 mt-10 flex max-w-xl flex-col gap-3 rounded-2xl bg-white/10 p-2 shadow-xl ring-1 ring-white/25 backdrop-blur-md sm:flex-row sm:items-stretch sm:p-2"
          >
            <label className="sr-only" htmlFor="hero-location">
              Location
            </label>
            <input
              id="hero-location"
              type="text"
              value={heroLocation}
              onChange={(e) => setHeroLocation(e.target.value)}
              placeholder="City, region, or Remote"
              className="flex-1 rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              Search
            </button>
          </form>

          <div className="animate-fadeInUp animation-delay-600 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              Browse Jobs
            </Link>
            <Link
              to="/recruiter/jobs/new"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/70 bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <LandingStatsBar />

      {/* —— Featured Jobs —— */}
      <section id="featured" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured opportunities</h2>
              <p className="mt-2 max-w-xl text-slate-600">
                Fresh roles across internships and graduate positions—updated from our live listings.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-10">
          {featuredLoading ? (
            <FeaturedSkeleton />
          ) : featuredError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {featuredError}
            </p>
          ) : featured.length === 0 ? (
            <p className="text-center text-slate-600">
              No jobs yet.{" "}
              <Link to="/jobs" className="font-medium text-indigo-600 hover:text-indigo-500">
                Browse all listings
              </Link>
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((job, i) => (
                <Reveal key={job._id} delayClass={i % 3 === 1 ? "animation-delay-150" : ""}>
                  <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm"
                        aria-hidden
                      >
                        {companyInitials(job)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 font-semibold text-slate-900">{job.title}</h3>
                        <p className="mt-1 truncate text-sm text-slate-600">
                          {job.postedBy?.companyName || job.postedBy?.name || "Organization"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeClasses(job.type)}`}
                      >
                        {job.type?.replace("-", " ")}
                      </span>
                      <span className="text-xs text-slate-500">{job.location}</span>
                      {job.salary && (
                        <span className="text-xs font-medium text-slate-700">{job.salary}</span>
                      )}
                    </div>
                    <div className="mt-auto pt-6">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Link
            to="/jobs"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
          >
            View All Jobs
          </Link>
        </Reveal>
      </section>

      {/* —— How it works —— */}
      <section className="border-y border-slate-200 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              Three simple steps from signup to your next offer.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Register",
                body: "Create your student or recruiter account in minutes with secure campus-ready auth.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                ),
              },
              {
                title: "Browse Jobs",
                body: "Filter by location and role type, save bookmarks, and open rich job detail pages.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                ),
              },
              {
                title: "Apply & Get Hired",
                body: "Submit applications with your profile resume, track status, and hear from recruiters.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                ),
              },
            ].map((step, index) => (
              <Reveal key={step.title} delayClass={index === 1 ? "animation-delay-150" : index === 2 ? "animation-delay-300" : ""}>
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/80 p-8 text-center shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {step.icon}
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* —— Testimonials —— */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal>
          <h2 className="text-center text-3xl font-bold text-slate-900">Students love the clarity</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Real workflows from campuses using CampusConnect-style hiring journeys.
          </p>
        </Reveal>
        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              className="min-w-[85vw] snap-center shrink-0 md:min-w-0"
              delayClass={i === 1 ? "animation-delay-150" : i === 2 ? "animation-delay-300" : ""}
            >
              <blockquote className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="flex-1 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <cite className="not-italic text-sm font-semibold text-slate-900">{t.name}</cite>
                    <p className="text-xs text-slate-500">{t.university}</p>
                  </div>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      {/* —— Recruiter CTA —— */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-16 sm:px-6">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Are you a Recruiter? Post jobs and find top talent
            </h2>
            <p className="mt-3 text-indigo-100">
              Publish listings, manage applicants, and spotlight your employer brand—all in one
              recruiter workspace.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Start Hiring
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
