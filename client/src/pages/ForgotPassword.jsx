import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setSuccess(
        response.data.message ||
          "If the email exists, a password reset link has been sent."
      );
      setEmail("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not send reset link. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-md sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter your email and we will send a reset link.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="you@university.edu"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        {success && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Back to{" "}
        <Link to="/login" className="font-medium text-blue-700 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
