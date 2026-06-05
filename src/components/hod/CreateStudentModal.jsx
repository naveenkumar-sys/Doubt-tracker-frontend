import React, { useState, useEffect } from 'react';
import { GraduationCap, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CreateStudentModal = ({ onClose, onSuccess, defaultSemester }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        semester: defaultSemester || '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (defaultSemester) {
            setForm((p) => ({ ...p, semester: defaultSemester }));
        }
    }, [defaultSemester]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';

        if (!form.password.trim()) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
        else if (!/[A-Z]/.test(form.password)) e.password = 'Password must contain at least one uppercase letter';
        else if (!/[a-z]/.test(form.password)) e.password = 'Password must contain at least one lowercase letter';
        else if (!/[0-9]/.test(form.password)) e.password = 'Password must contain at least one number';
        else if (!/[@$!%*?&]/.test(form.password)) e.password = 'Password must contain at least one special character (@$!%*?&)';

        if (!form.semester) e.semester = 'Semester is required';
        else {
            const n = Number(form.semester);
            if (!Number.isInteger(n) || n < 1 || n > 12) e.semester = 'Semester must be between 1 and 12';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post('/users/register', {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                role: 'student',
                semester: Number(form.semester),
            });
            toast.success('Student account created successfully');
            onSuccess?.();
            onClose?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <GraduationCap size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Create Student</h2>
                            <p className="text-xs text-gray-500">HOD can onboard students for their department</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Naveen Kumar"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="e.g. student@gmail.com"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            placeholder="Min 8 chars, uppercase, number, special char"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Semester <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={12}
                            value={form.semester}
                            onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                            placeholder="e.g. 5"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${errors.semester ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.semester && <p className="text-xs text-red-500 mt-1">{errors.semester}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating...' : 'Create Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStudentModal;

