/**
 * One-off: set postedBy on all jobs to the recruiter named / identified as recruiter1.
 *
 * Matches User with role "recruiter" and either:
 *   - name equal to "recruiter1" (case-insensitive), or
 *   - email containing "recruiter1" (case-insensitive)
 *
 * Usage (from server/):
 *   node scripts/linkJobsToRecruiter1.js
 *   node scripts/linkJobsToRecruiter1.js recruiter1@yourdomain.com
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");

const run = async () => {
  const emailArg = process.argv[2];

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  let recruiter = null;
  if (emailArg) {
    recruiter = await User.findOne({
      email: emailArg.toLowerCase().trim(),
      role: "recruiter",
    });
  } else {
    recruiter = await User.findOne({
      role: "recruiter",
      $or: [
        { name: { $regex: /^recruiter1$/i } },
        { email: { $regex: /recruiter1/i } },
      ],
    });
  }

  if (!recruiter) {
    console.error(
      "No recruiter found. Register a recruiter with name 'recruiter1' or email containing 'recruiter1', or pass email:\n" +
        "  node scripts/linkJobsToRecruiter1.js recruiter1@example.com"
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const result = await Job.updateMany(
    {},
    { $set: { postedBy: recruiter._id } }
  );

  console.log(
    `Linked all jobs to recruiter: ${recruiter.name} <${recruiter.email}> (${recruiter._id})`
  );
  console.log(`Updated documents: ${result.modifiedCount} / matched: ${result.matchedCount}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
