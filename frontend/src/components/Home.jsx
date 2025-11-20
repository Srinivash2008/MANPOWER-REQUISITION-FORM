// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to PDMR ACS HD</h2>
        <p className="text-lg text-gray-700 mb-6">
          This is the home page. Please log in to access the system.
        </p>
        <Link
          to="/login"
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
