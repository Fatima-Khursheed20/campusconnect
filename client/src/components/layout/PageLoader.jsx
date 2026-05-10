const PageLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Loading Page...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
