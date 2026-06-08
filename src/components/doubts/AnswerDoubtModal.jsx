import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AnswerDoubtModal = ({ doubtId, doubtTitle, onClose, onSuccess }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Answer content is required');
            return;
        }
        if (content.trim().length < 5) {
            setError('Answer must be at least 5 characters');
            return;
        }

        setLoading(true);
        try {
            await api.post('/answers/createAnswer', {
                doubtId,
                content: content.trim(),
            });
            toast.success('Answer posted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post answer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <MessageSquare size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Answer Doubt</h2>
                            <p className="max-w-md truncate text-xs text-gray-500">{doubtTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Your Answer *</label>
                        <textarea
                            value={content}
                            onChange={(e) => { setContent(e.target.value); setError(''); }}
                            placeholder="Write your answer in detail. Include explanations, code snippets, or references..."
                            rows={8}
                            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                        <p className="mt-1 text-xs text-gray-400">{content.length}/10000</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {loading ? 'Posting...' : 'Post Answer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnswerDoubtModal;
