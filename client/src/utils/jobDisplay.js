export function getTypeBadgeClasses(type) {
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
}

export function companyInitials(job) {
  const name = job?.postedBy?.companyName?.trim() || job?.postedBy?.name?.trim() || "C";
  return name.slice(0, 2).toUpperCase();
}
