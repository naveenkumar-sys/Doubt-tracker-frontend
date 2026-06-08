import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';

const CreateFacultyModal = ({ onClose, onSuccess }) => {
    const { user: loggedInUser } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!loggedInUser?.departmentId) {
                setSubjectsLoading(false);
                return;
            }
            try {
                const res = await api.get(`/subjects/getSubject/${loggedInUser.departmentId}`);
                setAvailableSubjects(res.data.data?.subjects || []);
            } catch {
                toast.error('Failed to load subjects');
            } finally {
                setSubjectsLoading(false);
            }
        };
        fetchSubjects();
    }, [loggedInUser?.departmentId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSubject = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password } = form;

        if (!name.trim()) return toast.error('Faculty name is required');
        if (!email.trim()) return toast.error('Faculty email is required');
        if (!password.trim()) return toast.error('Faculty password is required');

        setLoading(true);
        try {
            await api.post('/users/register', {
                name: name.trim(),
                email: email.trim(),
                password,
                role: 'faculty',
                subjectIds: selectedIds.length > 0 ? selectedIds : undefined,
            });

            toast.success(
                selectedIds.length > 0
                    ? `Faculty created with ${selectedIds.length} subject(s)`
                    : 'Faculty created successfully'
            );
            onSuccess?.();
            onClose?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Create Faculty</h2>
                        <p className="text-xs text-gray-500">HOD can create faculty for their department</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Faculty Name</label>
                        <input
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="e.g. faculty@gmail.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            placeholder="Set password"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Assign Subjects <span className="text-gray-400 font-normal">(optional)</span>
                        </label>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex w-full items-center justify-between rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <span className={selectedIds.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
                                    {selectedIds.length === 0
                                        ? 'Select subjects...'
                                        : `${selectedIds.length} subject(s) selected`}
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                                    {subjectsLoading ? (
                                        <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                                            <Loader2 size={16} className="mr-2 animate-spin" /> Loading...
                                        </div>
                                    ) : availableSubjects.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-gray-400">
                                            No subjects available
                                        </div>
                                    ) : (
                                        availableSubjects
                                            .filter((s) => s.isActive)
                                            .map((s) => (
                                                <label
                                                    key={s._id}
                                                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-emerald-50"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(s._id)}
                                                        onChange={() => toggleSubject(s._id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="font-medium text-gray-700">{s.name}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {s.code} - Sem {s.semester}
                                                    </span>
                                                </label>
                                            ))
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedIds.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {availableSubjects
                                    .filter((s) => selectedIds.includes(s._id))
                                    .map((s) => (
                                        <span
                                            key={s._id}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                                        >
                                            {s.name} ({s.code})
                                            <button
                                                type="button"
                                                onClick={() => toggleSubject(s._id)}
                                                className="ml-0.5 rounded p-0.5 transition hover:bg-emerald-200"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                            </div>
                        )}
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
                            {loading ? 'Creating...' : 'Create Faculty'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFacultyModal;
