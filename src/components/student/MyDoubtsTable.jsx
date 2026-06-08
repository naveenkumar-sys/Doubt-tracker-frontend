import { HelpCircle, Loader2, Search } from 'lucide-react';

const STATUS_FILTERS = [
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
];

const STATUS_BADGES = {
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    resolved: { label: 'Resolved', class: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', class: 'bg-gray-100 text-gray-600' },
    draft: { label: 'Draft', class: 'bg-gray-100 text-gray-600' },
};

const MyDoubtsTable = ({ doubts, loading, search, onSearchChange, statusFilter, onStatusFilterChange, pagination, onPageChange, onViewDoubt }) => {
    const filteredDoubts = doubts.filter((d) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            d.title.toLowerCase().includes(q) ||
            (d.subjectId?.name || '').toLowerCase().includes(q) ||
            (d.topic || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <HelpCircle size={20} className="text-purple-600" />
                        My Doubts
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">{doubts.length} doubt(s) total</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search doubts..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-400 sm:w-52"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-1 border-b bg-gray-50/50 px-5 py-3">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => onStatusFilterChange(f.key)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            statusFilter === f.key
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 size={28} className="mr-3 animate-spin" /> Loading doubts...
                </div>
            ) : filteredDoubts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <HelpCircle size={40} className="mb-3 opacity-30" />
                    <p className="font-medium">No doubts found</p>
                    <p className="mt-1 text-sm">
                        {search ? 'Try a different search term' : statusFilter ? `No ${statusFilter} doubts` : 'Ask your first doubt!'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <th className="px-6 py-3 text-left font-semibold">#</th>
                                    <th className="px-6 py-3 text-left font-semibold">Title</th>
                                    <th className="px-6 py-3 text-left font-semibold">Subject</th>
                                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                                    <th className="px-6 py-3 text-left font-semibold">Priority</th>
                                    <th className="px-6 py-3 text-left font-semibold">Created</th>
                                    <th className="px-6 py-3 text-left font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredDoubts.map((doubt, index) => {
                                    const badge = STATUS_BADGES[doubt.status] || STATUS_BADGES.pending;
                                    return (
                                        <tr key={doubt._id} className="transition hover:bg-purple-50/30">
                                            <td className="px-6 py-4 font-medium text-gray-400">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                                        <HelpCircle size={14} className="text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-800">{doubt.title}</span>
                                                        {doubt.topic && (
                                                            <p className="mt-0.5 text-xs text-gray-400">{doubt.topic}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {doubt.subjectId?.code || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.class}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                                        doubt.status === 'pending' ? 'bg-yellow-500' :
                                                        doubt.status === 'in_progress' ? 'bg-blue-500' :
                                                        doubt.status === 'resolved' ? 'bg-green-500' :
                                                        'bg-gray-500'
                                                    }`}></span>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold ${
                                                    doubt.priority === 'high' ? 'text-red-600' :
                                                    doubt.priority === 'low' ? 'text-gray-400' :
                                                    'text-yellow-600'
                                                }`}>
                                                    {doubt.priority || 'medium'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(doubt.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => onViewDoubt(doubt._id)}
                                                    className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <p className="text-xs text-gray-400">
                                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyDoubtsTable;
