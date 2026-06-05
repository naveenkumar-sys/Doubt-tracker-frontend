import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Loader2, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} <span className="text-red-500">*</span>
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const CreateHodModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'hod', // fixed — admin can only create HODs
        collegeId: '',
        departmentId: '',
    });
    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredDepts, setFilteredDepts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    // Fetch all active colleges and all departments on mount
    useEffect(() => {
        const fetchData = async () => {
            //promise.all will execute both api calls at the same time and wait for both to complete before moving on 
            //this is more efficient than using two separate await calls 
            //if any of the api calls fails then the promise.all will reject and the catch block will be executed
            try {
                const [collegeRes, deptRes] = await Promise.all([
                    api.get('/colleges/getAllColleges'),
                    api.get('/departments/getAllDepartments'),
                ]);
                const allColleges = collegeRes.data.data?.colleges || collegeRes.data.data || [];
                const allDepts = deptRes.data.data?.departments || deptRes.data.data || [];
                // It only give active colleges and departments to the dropdown 
                setColleges(allColleges.filter(c => c.isActive));
                setDepartments(allDepts.filter(d => d.isActive));
            } catch {
                toast.error('Failed to load colleges or departments');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // When a college is selected, filter departments for that college
    useEffect(() => {
        if (form.collegeId) {
            const depts = departments.filter(d =>
                (d.collegeId?._id || d.collegeId) === form.collegeId
            );
            setFilteredDepts(depts);
            // Reset department selection when college changes
            setForm(p => ({ ...p, departmentId: '' }));
        } else {
            setFilteredDepts([]);
        }
    }, [form.collegeId, departments]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        else if (form.name.length < 2) e.name = 'Name must be at least 2 characters';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
        else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain at least one uppercase letter';
        else if (!/[a-z]/.test(form.password)) e.password = 'Must contain at least one lowercase letter';
        else if (!/[0-9]/.test(form.password)) e.password = 'Must contain at least one number';
        else if (!/[@$!%*?&]/.test(form.password)) e.password = 'Must contain at least one special character (@$!%*?&)';
        if (!form.collegeId) e.collegeId = 'Please select a college';
        if (!form.departmentId) e.departmentId = 'Please select a department';
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
                role: 'hod',
                collegeId: form.collegeId,
                departmentId: form.departmentId,
            });
            toast.success('HOD account created successfully!');
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create HOD';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <UserCog size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Onboard HOD</h2>
                            <p className="text-xs text-gray-500">Create a Head of Department account</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                            <Loader2 size={20} className="animate-spin mr-2" /> Loading data...
                        </div>
                    ) : (
                        <>
                            {/* Full Name */}
                            <Field label="Full Name" error={errors.name}>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Dr. Rajesh Kumar"
                                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                            </Field>

                            {/* Email */}
                            <Field label="Email Address" error={errors.email}>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="e.g. hod.cse@college.edu"
                                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                            </Field>

                            {/* Password */}
                            <Field label="Password" error={errors.password}>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        placeholder="Min 8 chars, uppercase, number, special char"
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-orange-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Must include: uppercase, lowercase, number, and @$!%*?&</p>
                            </Field>

                            {/* College Selector */}
                            <Field label="Assign College" error={errors.collegeId}>
                                <select
                                    value={form.collegeId}
                                    onChange={e => setForm(p => ({ ...p, collegeId: e.target.value }))}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-orange-500 bg-white ${errors.collegeId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                >
                                    <option value="">-- Select a college --</option>
                                    {colleges.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                                    ))}
                                </select>
                            </Field>

                            {/* Department Selector — only enabled after college is selected */}
                            <Field label="Assign Department" error={errors.departmentId}>
                                <select
                                    value={form.departmentId}
                                    onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                                    disabled={!form.collegeId || filteredDepts.length === 0}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-orange-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.departmentId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                >
                                    <option value="">
                                        {!form.collegeId
                                            ? '-- Select a college first --'
                                            : filteredDepts.length === 0
                                                ? '-- No departments for this college --'
                                                : '-- Select a department --'}
                                    </option>
                                    {filteredDepts.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                            </Field>

                            {/* Info Banner */}
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs text-orange-700">
                                <strong>Note:</strong> The HOD will be assigned exclusively to this college and department. They will be responsible for adding subjects, faculty, and students within their department.
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {loading ? 'Creating...' : 'Create HOD Account'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateHodModal;
