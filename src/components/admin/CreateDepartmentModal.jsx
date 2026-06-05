import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CreateDepartmentModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', code: '', collegeId: '' });
    const [colleges, setColleges] = useState([]);
    const [loadingColleges, setLoadingColleges] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch active colleges to populate the dropdown
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const res = await api.get('/colleges/getAllColleges');
                const all = res.data.data?.colleges || res.data.data || [];
                // Only show active colleges in the dropdown
                setColleges(all.filter(c => c.isActive));
            } catch {
                toast.error('Could not load colleges list');
            } finally {
                setLoadingColleges(false);
            }
        };
        fetchColleges();
    }, []);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Department name is required';
        else if (form.name.length < 2) e.name = 'Name must be at least 2 characters';
        if (!form.code.trim()) e.code = 'Department code is required';
        else if (!/^[a-zA-Z0-9_-]+$/.test(form.code)) e.code = 'Only letters, numbers, hyphens & underscores allowed';
        if (!form.collegeId) e.collegeId = 'Please select a college';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await api.post('/departments/createDepartment', {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                collegeId: form.collegeId,
            });
            toast.success('Department created successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create department';
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
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <GraduationCap size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Create Department</h2>
                            <p className="text-xs text-gray-500">Add a new department under a college</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* College Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select College <span className="text-red-500">*</span>
                        </label>
                        {loadingColleges ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                                <Loader2 size={16} className="animate-spin" /> Loading colleges...
                            </div>
                        ) : (
                            <select
                                value={form.collegeId}
                                onChange={e => setForm(p => ({ ...p, collegeId: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-purple-500 bg-white ${errors.collegeId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            >
                                <option value="">-- Select a college --</option>
                                {colleges.map(c => (
                                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        )}
                        {errors.collegeId && <p className="text-xs text-red-500 mt-1">{errors.collegeId}</p>}
                    </div>

                    {/* Department Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Computer Science and Engineering"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-purple-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Department Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                            placeholder="e.g. CSE or MECH"
                            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-purple-500 ${errors.code ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        <p className="text-xs text-gray-400 mt-1">Must be unique within the selected college. Will be uppercased.</p>
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || loadingColleges}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating...' : 'Create Department'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDepartmentModal;




