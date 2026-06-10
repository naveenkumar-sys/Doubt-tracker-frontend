import { useState, useEffect } from 'react';
import { CheckCircle, Clock, HelpCircle, Loader2, MessageSquare, RefreshCw, ThumbsUp, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';

const STATUS_BADGES = {
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    resolved: { label: 'Resolved', class: 'bg-green-100 text-green-700' },
    revision_requested: { label: 'Revision Requested', class: 'bg-orange-100 text-orange-700' },
    closed: { label: 'Closed', class: 'bg-gray-100 text-gray-600' },
    draft: { label: 'Draft', class: 'bg-gray-100 text-gray-600' },
};

const DoubtDetailModal = ({ doubtId, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [doubt, setDoubt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);
    const [closing, setClosing] = useState(false);
    const [showResubmitForm, setShowResubmitForm] = useState(false);
    const [resubmitReason, setResubmitReason] = useState('');
    const [resubmitting, setResubmitting] = useState(false);
    const [facultyName, setFacultyName] = useState('');
    //   console.log(doubt);
    useEffect(() => {
        const fetchDoubt = async () => {
            try {
                const res = await api.get(`/doubts/getDoubtById/${doubtId}`);
                setDoubt(res.data.data?.doubt);
            
                const facultyRes = await api.get(`/faculty/getFaculty/${res.data.data?.doubt?.assignedFacultyId._id}`);
                setFacultyName(facultyRes.data.data?.faculty?.name);
                // console.log(facultyRes);
                
            } catch {
                toast.error('Failed to load doubt details');
            } finally {
                setLoading(false);
            }
        };
      
        
        const fetchAnswers = async () => {
            try {
                const res = await api.get(`/answers/doubt/${doubtId}`);
                setAnswers(res.data.data?.answers || []);
            } catch {
                // answers may not exist yet
            } finally {
                setAnswersLoading(false);
            }
        };
        fetchDoubt();
        fetchAnswers();
    }, [doubtId]);

    const handleAcceptAnswer = async (answerId) => {
        setAcceptingId(answerId);
        try {
            await api.patch(`/answers/acceptAnswer/${answerId}/`);
            toast.success('Answer accepted successfully');
            onUpdate();
            // Refresh answers
            const res = await api.get(`/answers/doubt/${doubtId}`);
            setAnswers(res.data.data?.answers || []);
            // Refresh doubt
            const doubtRes = await api.get(`/doubts/getDoubtById/${doubtId}`);
            setDoubt(doubtRes.data.data?.doubt);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept answer');
        } finally {
            setAcceptingId(null);
        }
    };

    const handleResubmit = async () => {
        setResubmitting(true);
        try {
            await api.patch(`/doubts/resubmit/${doubtId}`, { reason: resubmitReason });
            toast.success('Resubmitted successfully. Faculty will re-answer your doubt.');
            onUpdate();
            setShowResubmitForm(false);
            setResubmitReason('');
            const res = await api.get(`/doubts/getDoubtById/${doubtId}`);
            setDoubt(res.data.data?.doubt);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resubmit doubt');
        } finally {
            setResubmitting(false);
        }
    };

    const handleCloseDoubt = async () => {
        setClosing(true);
        try {
            await api.patch(`/doubts/updateDoubtStatus/${doubtId}`, { status: 'closed' });
            toast.success('Doubt closed successfully');
            onUpdate();
            const res = await api.get(`/doubts/getDoubtById/${doubtId}`);
            setDoubt(res.data.data?.doubt);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to close doubt');
        } finally {
            setClosing(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl">
                    <Loader2 size={24} className="animate-spin text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Loading doubt...</span>
                </div>
            </div>
        );
    }

    if (!doubt) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="rounded-2xl bg-white px-8 py-6 shadow-2xl">
                    <p className="text-gray-500">Doubt not found.</p>
                    <button onClick={onClose} className="mt-4 text-sm font-semibold text-purple-600 hover:underline">Close</button>
                </div>
            </div>
        );
    }

    const badge = STATUS_BADGES[doubt.status] || STATUS_BADGES.pending;
    const isOwner = user?.id === doubt.studentId?._id || user?.id === doubt.studentId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                            <HelpCircle size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Doubt Details</h2>
                            <p className="text-xs text-gray-500">View doubt and answers</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.class}`}>{badge.label}</span>
                            {doubt.priority && (
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${doubt.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        doubt.priority === 'low' ? 'bg-gray-100 text-gray-600' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>{doubt.priority}</span>
                            )}
                            {doubt.subjectId && (
                                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                                    {doubt.subjectId?.name} ({doubt.subjectId?.code})
                                </span>
                            )}
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-gray-900">{doubt.title}</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{doubt.description}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <User size={12} /> {doubt.studentId?.name || 'You'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {new Date(doubt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <User size={12} /> {facultyName || 'Unknown Faculty'}
                            </span>

                            {doubt.topic && <span className="rounded-md bg-gray-200 px-2 py-0.5 font-mono">{doubt.topic}</span>}
                            {doubt.tags?.length > 0 && doubt.tags.map((tag, i) => (
                                <span key={i} className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-600">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {doubt.status === 'revision_requested' && doubt.resubmitReason && (
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="mb-1 text-xs font-semibold text-orange-700">Your Revision Request</p>
                            <p className="text-sm text-orange-800">{doubt.resubmitReason}</p>
                            {doubt.resubmitCount > 0 && (
                                <p className="mt-1 text-xs text-orange-500">Resubmitted {doubt.resubmitCount} time(s)</p>
                            )}
                        </div>
                    )}

                    {isOwner && (doubt.status === 'resolved' || doubt.status === 'closed') && (
                        <div className="flex flex-col gap-3">
                            {!showResubmitForm ? (
                                <div className="flex justify-end gap-3">
                                    {doubt.status === 'resolved' && (
                                        <button
                                            onClick={handleCloseDoubt}
                                            disabled={closing}
                                            className="flex items-center gap-2 rounded-xl bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                                        >
                                            {closing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                            {closing ? 'Closing...' : 'Close Doubt'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowResubmitForm(true)}
                                        className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                                    >
                                        <RefreshCw size={16} />
                                        Request Re-answer
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                    <p className="mb-2 text-sm font-semibold text-orange-800">
                                        Explain why you're not satisfied with the answer:
                                    </p>
                                    <textarea
                                        value={resubmitReason}
                                        onChange={(e) => setResubmitReason(e.target.value)}
                                        placeholder="Describe what additional clarification you need..."
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button
                                            onClick={() => { setShowResubmitForm(false); setResubmitReason(''); }}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleResubmit}
                                            disabled={resubmitting}
                                            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
                                        >
                                            {resubmitting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                            {resubmitting ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <MessageSquare size={18} className="text-gray-500" />
                            <h3 className="text-base font-bold text-gray-900">Answers ({answers.length})</h3>
                        </div>

                        {answersLoading ? (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <Loader2 size={20} className="mr-2 animate-spin" /> Loading answers...
                            </div>
                        ) : answers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                                <MessageSquare size={36} className="mx-auto mb-3 text-gray-300" />
                                <p className="font-medium text-gray-500">No answers yet</p>
                                <p className="mt-1 text-sm text-gray-400">Faculty will answer your doubt soon.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {answers.map((answer) => (
                                    <div
                                        key={answer._id}
                                        className={`rounded-xl border p-5 transition ${answer.isAccepted
                                                ? 'border-green-200 bg-green-50/50'
                                                : 'border-gray-100 bg-white hover:bg-gray-50/50'
                                            }`}
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                                    {answer.facultyId?.name?.charAt(0)?.toUpperCase() || 'F'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{answer.facultyId?.name || 'Faculty'}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(answer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            {answer.isAccepted && (
                                                <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    <CheckCircle size={12} /> Accepted
                                                </span>
                                            )}
                                        </div>

                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{answer.content}</p>

                                        {isOwner && !answer.isAccepted && doubt.status !== 'closed' && doubt.status !== 'revision_requested' && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleAcceptAnswer(answer._id)}
                                                    disabled={acceptingId === answer._id}
                                                    className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-200 disabled:opacity-50"
                                                >
                                                    {acceptingId === answer._id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <ThumbsUp size={12} />
                                                    )}
                                                    Accept Answer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoubtDetailModal;
