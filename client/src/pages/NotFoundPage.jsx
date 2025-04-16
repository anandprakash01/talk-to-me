import {Link} from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-4">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-gray-500 mt-2">
          The URL might be incorrect or the page might have been moved.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block px-6 py-3 text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 rounded shadow"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
