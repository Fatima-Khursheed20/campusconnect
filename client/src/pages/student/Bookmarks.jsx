import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function typeBadge(type) {
  switch (type) {
    case "internship":
      return "bg-blue-100 text-blue-800";
    case "full-time":
      return "bg-green-100 text-green-800";
    case "part-time":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function companyLabel(job) {
  if (!job?.postedBy) return "Company";
  return job.postedBy.companyName || job.postedBy.name || "Company";
}

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users/bookmarks");
      setBookmarks(data.bookmarks || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await api.post(`/bookmarks/${jobId}`);
      setBookmarks((prev) => prev.filter((b) => String(b.job?._id) !== String(jobId)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update bookmark");
    }
  };

  if (loading) {
    return (
      <section className="rounded-lg bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Loading saved jobs…</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Bookmarked jobs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Roles you saved for later. Tap a card to view the full posting.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-14 text-center shadow-sm">
          <p className="text-slate-600">No bookmarks yet.</p>
          <Link
            to="/jobs"
            className="mt-3 inline-block font-medium text-blue-600 hover:text-blue-500"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bm) => {
            const job = bm.job;
            if (!job) return null;
            return (
              <article
                key={bm._id}
                className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between gap-2">
                  <Link to={`/jobs/${job._id}`} className="group flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{companyLabel(job)}</p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(job._id)}
                    className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-3 flex items-center gap-1 text-sm text-gray-600">
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {job.location}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge(
                      job.type
                    )}`}
                  >
                    {job.type?.replace("-", " ")}
                  </span>
                  {job.deadline && (
                    <span className="text-xs text-slate-500">
                      Deadline {formatDate(job.deadline)}
                    </span>
                  )}
                </div>
                <Link
                  to={`/jobs/${job._id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View details
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Bookmarks;
