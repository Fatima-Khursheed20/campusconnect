import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useForm from "../hooks/useForm";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePasswordMatch,
} from "../utils/validators";

const getPasswordStrength = (password) => {
  if (!password) return { label: "...", color: "bg-slate-200", width: "w-0" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
  if (score <= 3)
    return { label: "Medium", color: "bg-amber-500", width: "w-2/3" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
};

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "student",
  companyName: "",
};

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [serverError, setServerError] = useState("");
  const setErrorsRef = useRef(() => {});

  const validate = (values) => {
    const errors = {};
    errors.name = validateRequired(values.name, "Name");
    errors.email = validateEmail(values.email);
    errors.password = validatePassword(values.password);
    errors.confirmPassword = validatePasswordMatch(
      values.password,
      values.confirmPassword
    );

    if (values.role === "recruiter") {
      errors.companyName = validateRequired(values.companyName, "Company Name");
    }

    // Remove null/undefined errors
    Object.keys(errors).forEach((key) => {
      if (errors[key] === null) {
        delete errors[key];
      }
    });

    return errors;
  };

  const handleRegister = useCallback(
    async (formValues) => {
      setServerError("");
      try {
        const payload = {
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
          role: formValues.role,
        };

        if (formValues.role === "recruiter") {
          payload.companyName = formValues.companyName.trim();
        }

        await register(payload);
        navigate("/login", { state: { message: "Registration successful! Please log in." } });
      } catch (error) {
        const message =
          error.response?.data?.message || "Registration failed. Please try again.";
        if (error.response?.data?.errors) {
          const fieldErrors = error.response.data.errors.reduce((acc, errItem) => {
            acc[errItem.field] = errItem.message;
            return acc;
          }, {});
          setErrorsRef.current(fieldErrors);
        }
        setServerError(message);
      }
    },
    [register, navigate]
  );

  const {
    values,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    setErrors,
  } = useForm(initialFormState, validate, handleRegister);

  useEffect(() => {
    setErrorsRef.current = setErrors;
  }, [setErrors]);

  const strength = useMemo(
    () => getPasswordStrength(values.password),
    [values.password]
  );

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-md sm:p-8">
      <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Join CampusConnect as a student or recruiter.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
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
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select
            name="role"
            value={values.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        {values.role === "recruiter" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={values.companyName}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                errors.companyName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
              placeholder="Company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>
        )}

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
            placeholder="Create a strong password"
          />
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div className={`h-2 rounded-full ${strength.color} ${strength.width}`}></div>
          </div>
          <p className="mt-1 text-xs text-slate-600">Strength: {strength.label}</p>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {serverError && !Object.keys(errors).length && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
