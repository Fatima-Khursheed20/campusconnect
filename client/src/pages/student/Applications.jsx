import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "rejected", label: "Rejected" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function companyLabel(job) {
  if (!job?.postedBy) return "Company";
  return job.postedBy.companyName || job.postedBy.name || "Company";
}

function statusBadgeClass(status) {
  switch (status) {
    case "shortlisted":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "reviewed":
      return "bg-amber-100 text-amber-800";
    case "pending":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function matchesTab(app, tab) {
  if (tab === "all") return true;
  if (tab === "pending") return app.status === "pending" || app.status === "reviewed";
  if (tab === "shortlisted") return app.status === "shortlisted";
  if (tab === "rejected") return app.status === "rejected";
  return true;
}

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users/applications");
        setApplications(data.applications || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => applications.filter((a) => matchesTab(a, tab)),
    [applications, tab]
  );

  if (loading) {
    return (
      <section className="rounded-lg bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Loading applications…</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My applications</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every job you have applied to, with the latest status from recruiters.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setTab(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === f.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-6">Job title</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Applied</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-500 sm:px-6" colSpan={4}>
                    Nothing in this tab yet.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app._id}>
                    <td className="px-4 py-3 sm:px-6">
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="font-medium text-blue-700 hover:text-blue-600"
                      >
                        {app.job?.title || "Job"}
                      </Link>
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-3 text-slate-700">
                      {companyLabel(app.job)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Applications;
