import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CreateFacultyModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

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
                // role is validated by backend; collegeId/departmentId are optional and ignored for HOD
            });


            toast.success('Faculty created successfully');
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
                            <Plus size={16} />
                            {loading ? 'Creating...' : 'Create Faculty'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFacultyModal;

