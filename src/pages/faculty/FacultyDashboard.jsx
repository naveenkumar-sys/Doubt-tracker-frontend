import { useCallback, useEffect, useState } from 'react';
import { HelpCircle, LayoutDashboard, Loader2, MessageSquare, Play, RefreshCw, Search, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';
import FacultyNavbar from '../../components/layout/FacultyNavbar';
import StatCard from '../../components/common/StatCard';
import AnswerDoubtModal from '../../components/doubts/AnswerDoubtModal';
import FacultyDoubtDetailModal from '../../components/doubts/FacultyDoubtDetailModal';

const STATUS_FILTERS = [
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'revision_requested', label: 'Revision Requested' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
];

const STATUS_BADGES = {
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    revision_requested: { label: 'Revision Requested', class: 'bg-orange-100 text-orange-700' },
    resolved: { label: 'Resolved', class: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', class: 'bg-gray-100 text-gray-600' },
};

const FacultyDashboard = () => {
    const { user } = useAuth();

    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
    const [page, setPage] = useState(1);

    const [viewingDoubt, setViewingDoubt] = useState(null);
    const [answeringDoubt, setAnsweringDoubt] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchDoubts = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const params = { page: pageNum, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/doubts/getDoubts', { params });
            const data = res.data.data;
            setDoubts(data?.doubts || []);
            if (data?.pagination) setPagination(data.pagination);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load doubts');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchDoubts(1);
    }, [fetchDoubts]);

    const filteredDoubts = doubts.filter((d) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            d.title.toLowerCase().includes(q) ||
            (d.subjectId?.name || '').toLowerCase().includes(q) ||
            (d.studentId?.name || '').toLowerCase().includes(q)
        );
    });

    const stats = {
        total: pagination.total || doubts.length,
        pending: doubts.filter((d) => d.status === 'pending').length,
        inProgress: doubts.filter((d) => d.status === 'in_progress').length,
        revisionRequested: doubts.filter((d) => d.status === 'revision_requested').length,
        resolved: doubts.filter((d) => d.status === 'resolved').length,
    };

    const handleTakeDoubt = async (doubtId) => {
        setUpdatingId(doubtId);
        try {
            await api.patch(`/doubts/updateDoubtStatus/${doubtId}`, { status: 'in_progress' });
            toast.success('Doubt claimed — now in progress');
            fetchDoubts(page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to claim doubt');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAnswerClick = (doubtId, doubtTitle) => {
        setViewingDoubt(null);
        setAnsweringDoubt({ id: doubtId, title: doubtTitle });
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <FacultyNavbar />

            <main className="mx-auto max-w-6xl p-4 sm:p-8">
                <div className="mb-6">
                    <div className="mb-1 flex items-center gap-2">
                        <LayoutDashboard size={22} className="text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Faculty Dashboard</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        Welcome, {user?.name}. View and answer doubts from students.
                        {user?.subjectIds?.length > 0 && <span className="ml-1">You are assigned to {user.subjectIds.length} subject(s).</span>}
                        <span className="ml-1">{user?.collegeName && `${user.collegeName}`}{user?.departmentName && ` - ${user.departmentName}`}.</span>
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard icon={HelpCircle} label="Total Doubts" value={stats.total} color="bg-blue-600" />
                    <StatCard icon={TrendingUp} label="Pending" value={stats.pending} color="bg-yellow-500" />
                    <StatCard icon={Loader2} label="In Progress" value={stats.inProgress} color="bg-indigo-500" />
                    <StatCard icon={RefreshCw} label="Revision" value={stats.revisionRequested} color="bg-orange-500" />
                    <StatCard icon={MessageSquare} label="Resolved" value={stats.resolved} color="bg-green-500" />
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => { setStatusFilter(f.key); setPage(1); }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    statusFilter === f.key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search doubts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-400 sm:w-64"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-gray-400">
                            <Loader2 size={28} className="mr-3 animate-spin" /> Loading doubts...
                        </div>
                    ) : filteredDoubts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <HelpCircle size={40} className="mb-3 opacity-30" />
                            <p className="font-medium">No doubts found</p>
                            <p className="mt-1 text-sm">
                                {search ? 'Try a different search term' : statusFilter ? `No ${statusFilter} doubts` : 'No doubts available for your subjects'}
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
                                            <th className="px-6 py-3 text-left font-semibold">Student</th>
                                            <th className="px-6 py-3 text-left font-semibold">Subject</th>
                                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                                            <th className="px-6 py-3 text-left font-semibold">Created</th>
                                            <th className="px-6 py-3 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredDoubts.map((doubt, index) => {
                                            const badge = STATUS_BADGES[doubt.status] || STATUS_BADGES.pending;
                                            return (
                                                <tr key={doubt._id} className="transition hover:bg-blue-50/30">
                                                    <td className="px-6 py-4 font-medium text-gray-400">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                                                <HelpCircle size={14} className="text-blue-600" />
                                                            </div>
                                                            <span className="font-semibold text-gray-800">{doubt.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{doubt.studentId?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                            {doubt.subjectId?.code || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.class}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${
                                                                doubt.status === 'pending' ? 'bg-yellow-500' :
                                                                doubt.status === 'in_progress' ? 'bg-blue-500' :
                                                                doubt.status === 'revision_requested' ? 'bg-orange-500' :
                                                                doubt.status === 'resolved' ? 'bg-green-500' :
                                                                'bg-gray-500'
                                                            }`}></span>
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {new Date(doubt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setViewingDoubt(doubt._id)}
                                                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
                                                            >
                                                                View
                                                            </button>
                                                            {doubt.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleTakeDoubt(doubt._id)}
                                                                    disabled={updatingId === doubt._id}
                                                                    className="flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-50"
                                                                >
                                                                    {updatingId === doubt._id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                                                    Take
                                                                </button>
                                                            )}
                                                            {(doubt.status === 'in_progress' || doubt.status === 'revision_requested') && (
                                                                <button
                                                                    onClick={() => handleAnswerClick(doubt._id, doubt.title)}
                                                                    className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                                                                >
                                                                    Answer
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between border-t px-6 py-4">
                                    <p className="text-xs text-gray-400">
                                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setPage(page - 1); fetchDoubts(page - 1); }}
                                            disabled={page <= 1}
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => { setPage(page + 1); fetchDoubts(page + 1); }}
                                            disabled={page >= pagination.pages}
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
            </main>

            {viewingDoubt && (
                <FacultyDoubtDetailModal
                    doubtId={viewingDoubt}
                    onClose={() => setViewingDoubt(null)}
                    onAnswer={handleAnswerClick}
                />
            )}

            {answeringDoubt && (
                <AnswerDoubtModal
                    doubtId={answeringDoubt.id}
                    doubtTitle={answeringDoubt.title}
                    onClose={() => setAnsweringDoubt(null)}
                    onSuccess={() => fetchDoubts(page)}
                />
            )}
        </div>
    );
};

export default FacultyDashboard;
