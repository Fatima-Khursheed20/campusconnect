import { useEffect, useState } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { resolveUploadUrl } from "../../utils/resolveUploadUrl";

function normalizeEducation(eduList) {
  if (!eduList?.length) {
    return [{ school: "", degree: "", year: "" }];
  }
  return eduList.map((e) => ({
    school: e.institution || e.school || "",
    degree: e.degree || "",
    year: e.grade || e.year || "",
  }));
}

function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [education, setEducation] = useState(normalizeEducation([]));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled && data.user) {
          setUser(data.user);
        }
      } catch {
        /* use context user */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setBio(user.bio || "");
    setSkills(user.skills?.length ? [...user.skills] : []);
    setEducation(normalizeEducation(user.education));
  }, [user]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => {
    setSkills((prev) => prev.filter((x) => x !== s));
  };

  const updateEducationRow = (index, field, value) => {
    setEducation((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addEducationRow = () => {
    setEducation((prev) => [...prev, { school: "", degree: "", year: "" }]);
  };

  const removeEducationRow = (index) => {
    setEducation((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        name,
        bio,
        skills,
        education: education
          .map((row) => ({
            institution: row.school?.trim(),
            degree: row.degree?.trim(),
            grade: row.year?.toString().trim() || "",
          }))
          .filter((row) => row.institution || row.degree || row.grade),
      };
      const { data } = await api.put("/users/profile", payload);
      setUser(data.user);
      setMessage(data.message || "Saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const { data } = await api.post("/users/upload-resume", fd);
      setUser(data.user);
      setMessage(data.message || "Resume uploaded");
    } catch (err) {
      setError(err.response?.data?.message || "Resume upload failed");
    } finally {
      setResumeUploading(false);
      e.target.value = "";
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("profilePicture", file);
      const { data } = await api.post("/users/upload-profile-picture", fd);
      setUser(data.user);
      setMessage(data.message || "Photo updated");
    } catch (err) {
      setError(err.response?.data?.message || "Photo upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const resumeHref = resolveUploadUrl(user?.resumeUrl);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update how recruiters see you. Changes are saved when you tap Save profile.
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Profile photo
        </h2>
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            {user?.profilePicture ? (
              <img
                src={resolveUploadUrl(user.profilePicture)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-slate-400">
                {(user?.name || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {avatarUploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            <p className="mt-2 text-xs text-slate-500">JPEG, PNG, WebP or GIF · max 2MB</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resume</h2>
        <p className="mt-2 text-sm text-slate-600">
          PDF only · stored securely and attached when you apply (unless you override per job).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {user?.resumeUrl && resumeHref ? (
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View current resume
            </a>
          ) : (
            <span className="text-sm text-slate-500">No resume on file.</span>
          )}
          <label className="inline-flex cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {resumeUploading ? "Uploading…" : "Upload PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
          </label>
        </div>
      </section>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Details</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short overview of your background and interests…"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Skills</label>
          <p className="mt-1 text-xs text-slate-500">
            Type a skill and press Enter to add tags. Click × to remove.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="rounded-full p-0.5 hover:bg-blue-100"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add a skill…"
            className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-md"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label className="block text-sm font-medium text-slate-700">Education</label>
            <button
              type="button"
              onClick={addEducationRow}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              + Add row
            </button>
          </div>
          <div className="mt-3 space-y-4">
            {education.map((row, index) => (
              <div
                key={`edu-${index}`}
                className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-4"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600">School</label>
                  <input
                    value={row.school}
                    onChange={(e) => updateEducationRow(index, "school", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="University or school"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Degree</label>
                  <input
                    value={row.degree}
                    onChange={(e) => updateEducationRow(index, "degree", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Program or degree"
                  />
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <div className="flex-1 sm:flex-none">
                    <label className="block text-xs font-medium text-slate-600">Year</label>
                    <input
                      value={row.year}
                      onChange={(e) => updateEducationRow(index, "year", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-28"
                      placeholder="2026"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducationRow(index)}
                    className="self-end rounded-md border border-transparent px-2 py-2 text-sm text-red-600 hover:bg-red-50 sm:self-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
