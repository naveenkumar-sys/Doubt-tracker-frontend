import { useState, useCallback, useEffect } from 'react';
import { HelpCircle, Loader2, MessageSquare, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import SuggestionBar from '../common/SuggestionBar';

const STATUS_BADGES = {
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    revision_requested: { label: 'Revision Requested', class: 'bg-orange-100 text-orange-700' },
    resolved: { label: 'Resolved', class: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', class: 'bg-gray-100 text-gray-600' },
};

const BrowseDoubts = ({ onViewDoubt, onAskDoubt }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [suggestion, setSuggestion] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [page, setPage] = useState(1);

    // fetch doubts based on search query and page number - uses useCallback to avoid unnecessary re-renders
    const fetchDoubts = useCallback(async (q, pageNum = 1) => {
        if (!q.trim()) return;
        setLoading(true);
        setSearched(true);
        setSuggestion(null);
        try {
            const params = { search: q.trim(), page: pageNum, limit: 10 };
            const res = await api.get('/doubts/getDoubts', { params });
            const data = res.data.data;
            setDoubts(data?.doubts || []);
            if (data?.pagination) setPagination(data.pagination);
            if (data?.suggestion) setSuggestion(data.suggestion);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    }, []);
    // Fetch recent doubts for the "Recent Doubts" section
    const [recentDoubts, setRecentDoubts] = useState([]);
    const [recentLoading, setRecentLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await api.get('/doubts/getDoubts', { params: { page: 1, limit: 5 } });
                setRecentDoubts(res.data.data?.doubts || []);
            } catch {
                // silent
            } finally {
                setRecentLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchDoubts(searchQuery, 1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchDoubts(searchQuery, newPage);
    };

    const handleSearchCorrected = (correctedTerm) => {
        setSearchQuery(correctedTerm);
        setSuggestion(null);
        setPage(1);
        fetchDoubts(correctedTerm, 1);
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-bold text-gray-900">Find Answers</h3>
                <p className="mb-5 text-sm text-gray-400">
                    Search existing doubts and answers before asking a new question.
                </p>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search doubts by title, topic, or keywords..."
                            className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !searchQuery.trim()}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Search
                    </button>
                </form>
            </div>

            {/* Search Results */}
            {searched && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-gray-400">
                            <Loader2 size={28} className="mr-3 animate-spin" /> Searching...
                        </div>
                    ) : doubts.length === 0 ? (
                        <div className="space-y-4">
                            {suggestion && (
                                <SuggestionBar
                                    suggestion={suggestion}
                                    onSearchCorrected={handleSearchCorrected}
                                />
                            )}
                        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                            <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-bold text-gray-900">No doubts found</h3>
                            <p className="mx-auto mb-6 mt-2 max-w-md text-sm text-gray-500">
                                We couldn't find any doubts matching "{searchQuery}". This might be a great opportunity to ask a new question!
                            </p>
                            <button
                                onClick={onAskDoubt}
                                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                            >
                                Ask Your Doubt
                            </button>
                        </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500">
                                Found {pagination.total} result(s) for "<span className="font-medium text-gray-700">{searchQuery}</span>"
                            </p>
                            <div className="space-y-3">
                                {doubts.map((doubt) => {
                                    const badge = STATUS_BADGES[doubt.status] || STATUS_BADGES.pending;
                                    return (
                                        <button
                                            key={doubt._id}
                                            onClick={() => onViewDoubt(doubt._id)}
                                            className="w-full rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-purple-200 hover:shadow-md"
                                        >
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.class}`}>{badge.label}</span>
                                                {doubt.subjectId && (
                                                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">
                                                        {doubt.subjectId?.name}
                                                    </span>
                                                )}
                                                {doubt.topic && (
                                                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                                        {doubt.topic}
                                                    </span>
                                                )}
                                                <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                                                    <MessageSquare size={12} />
                                                    {doubt.answerCount || 0}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-semibold text-gray-900">{doubt.title}</h4>
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{doubt.description}</p>
                                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <User size={11} />
                                                    {doubt.studentId?.name || 'Anonymous'}
                                                </span>
                                                <span>
                                                    {new Date(doubt.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page <= 1}
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
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
                </>
            )}

            {/* Recent Doubts (shown before any search) */}
            {!searched && (
                <>
                    {recentLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <Loader2 size={24} className="animate-spin" />
                        </div>
                    ) : recentDoubts.length > 0 ? (
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Doubts</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {recentDoubts.map((doubt) => {
                                    const badge = STATUS_BADGES[doubt.status] || STATUS_BADGES.pending;
                                    return (
                                        <button
                                            key={doubt._id}
                                            onClick={() => onViewDoubt(doubt._id)}
                                            className="rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-purple-200 hover:shadow-md"
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.class}`}>{badge.label}</span>
                                                {doubt.subjectId && (
                                                    <span className="text-xs text-gray-400">{doubt.subjectId?.code}</span>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900">{doubt.title}</h4>
                                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{doubt.description}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                                <User size={11} />
                                                {doubt.studentId?.name || 'Anonymous'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
                            <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-bold text-gray-900">No doubts yet in your department</h3>
                            <p className="mx-auto mb-6 mt-2 max-w-md text-sm text-gray-500">
                                Be the first to ask a doubt and get help from faculty members.
                            </p>
                            <button
                                onClick={onAskDoubt}
                                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                            >
                                Ask Your First Doubt
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BrowseDoubts;
