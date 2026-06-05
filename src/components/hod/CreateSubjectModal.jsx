import { useState } from 'react';
import { BookOpen, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CreateSubjectModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', code: '', semester: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        const semesterNumber = Number(form.semester);

        if (!form.name.trim()) e.name = 'Subject name is required';
        else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

        if (!form.code.trim()) e.code = 'Subject code is required';
        else if (!/^[a-zA-Z0-9_-]+$/.test(form.code)) e.code = 'Only letters, numbers, hyphens and underscores allowed';

        if (!form.semester) e.semester = 'Semester is required';
        else if (!Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 12) {
            e.semester = 'Semester must be between 1 and 12';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post('/subjects/createSubject', {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                semester: Number(form.semester),
            });
            toast.success('Subject created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create subject');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <BookOpen size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Create Subject</h2>
                            <p className="text-xs text-gray-500">Add a subject for your department</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Subject Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Database Management Systems"
                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Subject Code</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                            placeholder="e.g. DBMS"
                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.code ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        <p className="mt-1 text-xs text-gray-400">Will be stored in uppercase.</p>
                        {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={form.semester}
                            onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
                            placeholder="e.g. 5"
                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.semester ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.semester && <p className="mt-1 text-xs text-red-500">{errors.semester}</p>}
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
                            disabled={loading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating...' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSubjectModal;
