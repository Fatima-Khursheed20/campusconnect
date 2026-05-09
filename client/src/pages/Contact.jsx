import { useState } from "react";
import api from "../services/api";
import Reveal from "../components/home/Reveal";

const emailPattern = /^\S+@\S+\.\S+$/;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!emailPattern.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.subject.trim()) next.subject = "Subject is required";
    if (!form.message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    try {
      setSubmitting(true);
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)?.[0]?.msg) ||
        "Something went wrong. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="-mx-4 sm:-mx-6">
      <section className="bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-14 text-center sm:px-6 lg:text-left">
        <div className="mx-auto max-w-6xl lg:flex lg:items-center lg:justify-between">
          <Reveal>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Contact us
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100 lg:mx-0">
              Partnerships, support, or product questions—we read every note and reply as soon as we can.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-xl font-semibold text-slate-900">Office &amp; contact</h2>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <a href="mailto:hello@campusconnect.edu" className="text-indigo-600 hover:text-indigo-500">
                    hello@campusconnect.edu
                  </a>
                </li>
                <li>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <a href="tel:+921234567890" className="text-slate-700 hover:text-indigo-600">
                    +92 (123) 456-7890
                  </a>
                </li>
                <li>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Campus HQ</p>
                  <p>University Technology Center, Sector H-12</p>
                  <p>Islamabad, Pakistan</p>
                </li>
              </ul>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <iframe
                  title="CampusConnect map placeholder"
                  src="https://maps.google.com/maps?q=Islamabad+Pakistan&z=13&output=embed"
                  className="aspect-[16/11] min-h-[220px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <p className="border-t border-slate-200 bg-white px-3 py-2 text-center text-xs text-slate-500">
                  Map preview — customize the embed URL for your office.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delayClass="animation-delay-150">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold text-slate-900">Send a message</h2>
                <p className="mt-2 text-sm text-slate-600">
                  All fields are required. Messages are routed through our secure contact endpoint.
                </p>

                {success ? (
                  <div
                    role="status"
                    className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-emerald-900"
                  >
                    <p className="font-semibold">Thank you!</p>
                    <p className="mt-2 text-sm leading-relaxed">
                      Your note is on its way—we&apos;ll reply to the email you provided shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
                    {apiError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {apiError}
                      </div>
                    )}
                    <div>
                      <label htmlFor="c-name" className="block text-sm font-medium text-slate-700">
                        Name
                      </label>
                      <input
                        id="c-name"
                        value={form.name}
                        onChange={onChange("name")}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoComplete="name"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-email" className="block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        id="c-email"
                        type="email"
                        value={form.email}
                        onChange={onChange("email")}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoComplete="email"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-subject" className="block text-sm font-medium text-slate-700">
                        Subject
                      </label>
                      <input
                        id="c-subject"
                        value={form.subject}
                        onChange={onChange("subject")}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-message" className="block text-sm font-medium text-slate-700">
                        Message
                      </label>
                      <textarea
                        id="c-message"
                        rows={5}
                        value={form.message}
                        onChange={onChange("message")}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
                    >
                      {submitting ? "Sending…" : "Send message"}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
