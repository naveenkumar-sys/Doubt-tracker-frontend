import { useState, useEffect } from 'react';
import { CheckCircle, Clock, HelpCircle, Loader2, MessageSquare, Play, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';

const STATUS_BADGES = {
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    revision_requested: { label: 'Revision Requested', class: 'bg-orange-100 text-orange-700' },
    resolved: { label: 'Resolved', class: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', class: 'bg-gray-100 text-gray-600' },
};

const FacultyDoubtDetailModal = ({ doubtId, onClose, onAnswer }) => {
    const { user } = useAuth();
    const [doubt, setDoubt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(true);
    const [taking, setTaking] = useState(false);

    useEffect(() => {
        const fetchDoubt = async () => {
            try {
                const res = await api.get(`/doubts/getDoubtById/${doubtId}`);
                setDoubt(res.data.data?.doubt);
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
                // silent
            } finally {
                setAnswersLoading(false);
            }
        };
        fetchDoubt();
        fetchAnswers();
    }, [doubtId]);

    const handleTake = async () => {
        setTaking(true);
        try {
            await api.patch(`/doubts/updateDoubtStatus/${doubtId}`, { status: 'in_progress' });
            toast.success('Doubt claimed');
            const res = await api.get(`/doubts/getDoubtById/${doubtId}`);
            setDoubt(res.data.data?.doubt);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to claim doubt');
        } finally {
            setTaking(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
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
                    <button onClick={onClose} className="mt-4 text-sm font-semibold text-blue-600 hover:underline">Close</button>
                </div>
            </div>
        );
    }

    const badge = STATUS_BADGES[doubt.status] || STATUS_BADGES.pending;
    const isAssignedToMe = doubt.assignedFacultyId?._id === user?.id || doubt.assignedFacultyId === user?.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <HelpCircle size={20} className="text-blue-600" />
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
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    doubt.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    doubt.priority === 'low' ? 'bg-gray-100 text-gray-600' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>{doubt.priority}</span>
                            )}
                            {doubt.subjectId && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                    {doubt.subjectId?.name} ({doubt.subjectId?.code})
                                </span>
                            )}
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-gray-900">{doubt.title}</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{doubt.description}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <User size={12} /> {doubt.studentId?.name || 'Student'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {new Date(doubt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {doubt.topic && <span className="rounded-md bg-gray-200 px-2 py-0.5 font-mono">{doubt.topic}</span>}
                            {doubt.assignedFacultyId && (
                                <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-blue-600">
                                    <User size={11} /> Assigned: {doubt.assignedFacultyId?.name || 'Faculty'}
                                </span>
                            )}
                        </div>
                    </div>

                    {doubt.status === 'pending' && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleTake}
                                disabled={taking}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {taking ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                {taking ? 'Claiming...' : 'Take & Start Working'}
                            </button>
                        </div>
                    )}

                    {doubt.status === 'revision_requested' && doubt.resubmitReason && (
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="mb-1 text-xs font-semibold text-orange-700">Student requested revision</p>
                            <p className="text-sm text-orange-800">{doubt.resubmitReason}</p>
                            {doubt.resubmitCount > 0 && (
                                <p className="mt-1 text-xs text-orange-500">Resubmitted {doubt.resubmitCount} time(s)</p>
                            )}
                        </div>
                    )}

                    {(doubt.status === 'in_progress' && isAssignedToMe) || doubt.status === 'revision_requested' ? (
                        <div className="flex justify-end">
                            <button
                                onClick={() => { onClose(); onAnswer(doubt._id, doubt.title); }}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <MessageSquare size={16} />
                                Answer This Doubt
                            </button>
                        </div>
                    ) : null}

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
                                <p className="mt-1 text-sm text-gray-400">Be the first to answer this doubt.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {answers.map((answer) => (
                                    <div
                                        key={answer._id}
                                        className={`rounded-xl border p-5 transition ${
                                            answer.isAccepted
                                                ? 'border-green-200 bg-green-50/50'
                                                : 'border-gray-100 bg-white'
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

export default FacultyDoubtDetailModal;
