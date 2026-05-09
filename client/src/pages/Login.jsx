import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useForm from "../hooks/useForm";
import { validateEmail, validateRequired } from "../utils/validators";

const initialFormState = {
  email: "",
  password: "",
  rememberMe: false,
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const from = location.state?.from?.pathname || null;
  const registrationMessage = location.state?.message || null;

  const validate = (values) => {
    const errors = {};
    errors.email = validateEmail(values.email);
    errors.password = validateRequired(values.password, "Password");

    Object.keys(errors).forEach((key) => {
      if (errors[key] === null) delete errors[key];
    });
    return errors;
  };

  const handleLogin = async (formValues) => {
    setServerError("");
    try {
      const user = await login(formValues);
      const targetPath = from || (user.role === "admin" ? "/admin" : `/${user.role}/dashboard`);
      navigate(targetPath, { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const {
    values,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  } = useForm(initialFormState, validate, handleLogin);

  return (
    <div className="grid min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-white shadow-md md:grid-cols-2">
      <div className="relative hidden md:flex md:flex-col md:justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-500 p-10 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
            CampusConnect
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">
            Launch your career journey with the right opportunity.
          </h2>
          <p className="mt-4 max-w-sm text-blue-100">
            Discover internships, apply to jobs, and connect with recruiters
            from top organizations.
          </p>
        </div>
        <div className="rounded-xl bg-white/15 p-4 backdrop-blur">
          <p className="text-sm text-blue-100">
            Trusted by students, recruiters, and campus placement teams.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to continue to your CampusConnect dashboard.
          </p>

          {registrationMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {registrationMessage}
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                placeholder="you@university.edu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={values.rememberMe}
                  onChange={(e) => handleChange({ target: { name: 'rememberMe', value: e.target.checked }})}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-900">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {serverError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-blue-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
