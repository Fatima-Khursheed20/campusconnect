import { useParams } from "react-router-dom";

function JobApplicants() {
  const { id } = useParams();

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">Job Applicants</h2>
      <p className="mt-2 text-slate-600">
        Reviewing applicants for job ID: <span className="font-medium">{id}</span>
      </p>
    </section>
  );
}

export default JobApplicants;
