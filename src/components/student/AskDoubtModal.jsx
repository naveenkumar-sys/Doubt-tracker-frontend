import { useState, useEffect } from 'react';
import { HelpCircle, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';

const AskDoubtModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '',
        description: '',
        subjectId: '',
        topic: '',
        tags: '',
    });
    const [subjects, setSubjects] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    // console.log(subjects);




    useEffect(() => {
        const fetchSubjects = async () => {
            if (!user?.departmentId) return;
            try {
                const res = await api.get(`/subjects/getSubject/${user.departmentId}`);
                setSubjects(res.data.data?.subjects || []);
            } catch {
                toast.error('Failed to load subjects');
            } finally {
                setSubjectsLoading(false);
            }
        };
        fetchSubjects();
    }, [user]);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        else if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
        else if (form.title.trim().length > 180) e.title = 'Title must be under 180 characters';

        if (!form.description.trim()) e.description = 'Description is required';
        else if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';

        if (!form.subjectId) e.subjectId = 'Please select a subject';

        if (form.topic && form.topic.length > 120) e.topic = 'Topic must be under 120 characters';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                subjectId: form.subjectId,
            };
            if (form.topic.trim()) payload.topic = form.topic.trim();
            if (form.tags.trim()) payload.tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);

            await api.post('/doubts/create', payload);
            toast.success('Doubt submitted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit doubt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                            <HelpCircle size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Ask a Doubt</h2>
                            <p className="text-xs text-gray-500">Describe your doubt in detail</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. What is the difference between DELETE and TRUNCATE?"
                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Explain your doubt in detail. Include what you've tried and what you're stuck on."
                            rows={5}
                            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                        <p className="mt-1 text-xs text-gray-400">{form.description.length}/5000</p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
                        {subjectsLoading ? (
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400">
                                <Loader2 size={14} className="animate-spin" /> Loading subjects...
                            </div>
                        ) : (
                            <select
                                value={form.subjectId}
                                onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 ${errors.subjectId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            >
                                <option value="">-- Select a subject --</option>
                                {subjects.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name} ({sub.code})
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.subjectId && <p className="mt-1 text-xs text-red-500">{errors.subjectId}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Topic</label>
                            <input
                                type="text"
                                value={form.topic}
                                onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                                placeholder="e.g. SQL, Joins, Normalization"
                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 ${errors.topic ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.topic && <p className="mt-1 text-xs text-red-500">{errors.topic}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                                placeholder="comma, separated, tags"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="mt-1 text-xs text-gray-400">Separate tags with commas</p>
                        </div>
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
                            disabled={loading || subjectsLoading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Submitting...' : 'Submit Doubt'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskDoubtModal;
