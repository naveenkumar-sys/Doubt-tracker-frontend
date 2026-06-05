import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorised = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h1 className="text-9xl font-extrabold text-red-500">403</h1>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Access Denied
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 mb-8">
                    You do not have permission to view this page.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorised;
