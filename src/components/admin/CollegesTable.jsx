import React from 'react';
import { Building2, Loader2, Search, Plus, CheckCircle, XCircle } from 'lucide-react';

const CollegesTable = ({ colleges, loading, search, onSearchChange, onCreateClick, onToggleStatus, updatingId }) => {
    // search bar logic
    const searchResults = colleges.filter(college=>
        college.name.toLowerCase().includes(search.toLowerCase()) ||
        college.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="p-5 border-b flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Building2 size={20} className="text-blue-600" /> Colleges
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{colleges.length} institution(s) registered</p>
                </div>
                <div className="flex gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search colleges..."
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-48"
                        />
                    </div>
                    {/* Create Button */}
                    <button
                        onClick={onCreateClick}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New College</span>
                    </button>
                </div>
            </div>

            {/* Table Body */}  
             {/* checking the college is fectching or not. if fetched then it will display the colleges list otherwise it will display the loading message. */}
              {/* checking the search results length is 0 or not. if 0 then it will display the no colleges found message otherwise it will display the colleges list. */}
               {/* checking the updatingId is equal to the college._id or not. if equal then it will display the updating message otherwise it will display the update button. */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 size={28} className="animate-spin mr-3" /> Loading colleges...
                </div>
            ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Building2 size={40} className="mb-3 opacity-30" />
                    <p className="font-medium">No colleges found</p>
                    <p className="text-sm mt-1">
                        {search ? 'Try a different search term' : 'Click "New College" to get started'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                <th className="text-left px-6 py-3 font-semibold">#</th>
                                <th className="text-left px-6 py-3 font-semibold">College Name</th>
                                <th className="text-left px-6 py-3 font-semibold">Code</th>
                                <th className="text-left px-6 py-3 font-semibold">Status</th>
                                <th className="text-left px-6 py-3 font-semibold">Created</th>
                                <th className="text-left px-6 py-3 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {searchResults.map((college, idx) => (
                                <tr key={college._id} className="hover:bg-blue-50/30 transition">
                                    <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 size={14} className="text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-gray-800">{college.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-mono text-xs font-bold">
                                            {college.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${college.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${college.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {college.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(college.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onToggleStatus(college)}
                                            disabled={updatingId === college._id}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 ${
                                                college.isActive
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                        >
                                            {updatingId === college._id
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : college.isActive ? <XCircle size={12} /> : <CheckCircle size={12} />
                                            }
                                            {college.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CollegesTable;
