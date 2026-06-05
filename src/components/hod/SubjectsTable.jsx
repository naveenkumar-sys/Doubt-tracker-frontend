import { BookOpen, CheckCircle, Loader2, Plus, Search, XCircle } from 'lucide-react';

const SubjectsTable = ({ subjects, loading, search,
    onSearchChange,
    onCreateClick, onToggleStatus, updatingId,
    onAssignFaculty,
}) => {


    // Filter subjects based on search query (by name, code, or semester)
    const filteredSubjects = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(search.toLowerCase()) ||
        subject.code.toLowerCase().includes(search.toLowerCase()) ||
        String(subject.semester).includes(search)
    );

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

            <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <BookOpen size={20} className="text-emerald-600" />
                        Subjects
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">{subjects.length} subject(s) in your department</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-400 sm:w-52"
                        />
                    </div>
                    <button
                        onClick={onCreateClick}
                        className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Subject</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 size={28} className="mr-3 animate-spin" /> Loading subjects...
                </div>
            ) : filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <BookOpen size={40} className="mb-3 opacity-30" />
                    <p className="font-medium">No subjects found</p>
                    <p className="mt-1 text-sm">
                        {search ? 'Try a different search term' : 'Create the first subject for your department'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-6 py-3 text-left font-semibold">#</th>
                                <th className="px-6 py-3 text-left font-semibold">Subject</th>
                                <th className="px-6 py-3 text-left font-semibold">Code</th>
                                <th className="px-6 py-3 text-left font-semibold">Semester</th>
                                <th className="px-6 py-3 text-left font-semibold">Status</th>
                                <th className="px-6 py-3 text-left font-semibold">Created</th>
                                <th className="px-6 py-3 text-left font-semibold">Action</th>
                                <th className="px-6 py-3 text-left font-semibold">Assign Faculty</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSubjects.map((subject, index) => (
                                <tr key={subject._id} className="transition hover:bg-emerald-50/30">
                                    <td className="px-6 py-4 font-medium text-gray-400">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                                                <BookOpen size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="font-semibold text-gray-800">{subject.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-700">
                                            {subject.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{subject.semester}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${subject.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${subject.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {subject.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(subject.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onToggleStatus(subject)}
                                            disabled={updatingId === subject._id}
                                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${subject.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                        >
                                            {updatingId === subject._id
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : subject.isActive ? <XCircle size={12} /> : <CheckCircle size={12} />
                                            }
                                            {subject.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                            onClick={() => onAssignFaculty?.(subject)}
                                            type="button"
                                        >
                                            Assign
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

export default SubjectsTable;
