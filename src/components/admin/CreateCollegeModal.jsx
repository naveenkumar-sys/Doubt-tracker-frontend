import React, { useState } from 'react';
import { Building2, Plus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CreateCollegeModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'College name is required';
        else if (form.name.length < 2) e.name = 'Name must be at least 2 characters';
        if (!form.code.trim()) e.code = 'College code is required';
        else if (!/^[a-zA-Z0-9_-]+$/.test(form.code)) e.code = 'Only letters, numbers, hyphens & underscores allowed';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await api.post('/colleges/createCollege', {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase()
            });
            toast.success('College created successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create college';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building2 size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Create College</h2>
                            <p className="text-xs text-gray-500">Add a new institution to the platform</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            College Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Sri Venkateswara University"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            College Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                            placeholder="e.g. SVU or MIT-2024"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${errors.code ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        <p className="text-xs text-gray-400 mt-1">Only letters, numbers, hyphens & underscores. Will be uppercased.</p>
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating...' : 'Create College'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCollegeModal;
