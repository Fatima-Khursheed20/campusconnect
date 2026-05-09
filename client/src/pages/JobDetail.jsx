import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resumeUrl: "",
  });

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || user.role !== "student") return;

    try {
      // Check if user has applied
      const applicationsResponse = await api.get("/applications/my-applications");
      const hasApplied = applicationsResponse.data.applications.some(
        (app) => app.job._id === id
      );
      setHasApplied(hasApplied);

      // Check if bookmarked
      const bookmarksResponse = await api.get("/applications/my-bookmarks");
      const isBookmarked = bookmarksResponse.data.bookmarks.some(
        (bookmark) => bookmark.job._id === id
      );
      setIsBookmarked(isBookmarked);
    } catch (err) {
      // Ignore errors for these checks
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setApplying(true);
      await api.post(`/applications/jobs/${id}/apply`, applicationData);
      setHasApplied(true);
      setShowApplyModal(false);
      setApplicationData({ coverLetter: "", resumeUrl: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isBookmarked) {
        await api.delete(`/applications/jobs/${id}/bookmark`);
        setIsBookmarked(false);
      } else {
        await api.post(`/applications/jobs/${id}/bookmark`);
        setIsBookmarked(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update bookmark");
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800">Error</h2>
            <p className="mt-2 text-red-700">{error || "Job not found"}</p>
            <Link
              to="/jobs"
              className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Jobs
          </Link>
        </div>

        {/* Job Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between lg:flex-row lg:items-start">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-1 text-lg text-gray-600">
                {job.postedBy?.name || "Company"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                </div>
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Deadline: {formatDate(job.deadline)}
                </div>
                {job.salary && (
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    {job.salary}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <span
                className={`inline-flex items-center self-start rounded-full px-3 py-1 text-sm font-medium ${getTypeBadgeColor(
                  job.type
                )}`}
              >
                {job.type.replace("-", " ")}
              </span>
              {user?.role === "student" && (
                <button
                  onClick={handleBookmark}
                  className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm ${
                    isBookmarked
                      ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill={isBookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Job Description
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            {job.description.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Company Info */}
        {job.postedBy && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              About the Company
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Company:</span> {job.postedBy.name}
              </p>
              {job.postedBy.companyName && (
                <p className="text-gray-700">
                  <span className="font-medium">Company Name:</span>{" "}
                  {job.postedBy.companyName}
                </p>
              )}
              {job.postedBy.companyWebsite && (
                <p className="text-gray-700">
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href={job.postedBy.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {job.postedBy.companyWebsite}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Apply Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {user?.role === "student" ? (
            hasApplied ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Application Submitted
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You have already applied for this position.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowApplyModal(true)}
                  disabled={!job.isActive || new Date() > new Date(job.deadline)}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply Now
                </button>
                {(!job.isActive || new Date() > new Date(job.deadline)) && (
                  <p className="mt-2 text-sm text-gray-500">
                    {!job.isActive
                      ? "This position is no longer accepting applications."
                      : "The application deadline has passed."}
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login to Apply
              </Link>
              <p className="mt-2 text-sm text-gray-500">
                You must be logged in as a student to apply for jobs.
              </p>
            </div>
          )}
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowApplyModal(false)}
              ></div>

              <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <form onSubmit={handleApply}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          Apply for {job.title}
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Cover Letter (Optional)
                            </label>
                            <textarea
                              rows={4}
                              value={applicationData.coverLetter}
                              onChange={(e) =>
                                setApplicationData((prev) => ({
                                  ...prev,
                                  coverLetter: e.target.value,
                                }))
                              }
                              placeholder="Tell us why you're interested in this position..."
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Resume URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={applicationData.resumeUrl}
                              onChange={(e) =>
                                setApplicationData((prev) => ({
                                  ...prev,
                                  resumeUrl: e.target.value,
                                }))
                              }
                              placeholder="https://example.com/resume.pdf"
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={applying}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetail;