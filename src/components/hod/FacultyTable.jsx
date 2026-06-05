import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Loader2, Plus, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import CreateFacultyModal from './CreateFacultyModal';

const FacultyTable = ({
    onAssignToSubject,
    faculty = [],
    setFaculty,
    loading,
    setLoading,
    search = '',
    setSearch,
    showCreate,
    setShowCreate,
    updatingId,
    setUpdatingId,
}) => {
    //Create API call to fetch faculty for the HOD's department 
    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const res = await api.get('/faculty/getFaculty');
            setFaculty(res.data.data?.faculty || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load faculty');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    // Filter faculty based on search query matching name or email (case-insensitive)
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return faculty;
        return faculty.filter((f) =>
            f.name.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q)
        );
    }, [faculty, search]);

    // Toggle faculty active/inactive status
    const toggleFacultyStatus = async (f) => {
        setUpdatingId(f._id);
        try {
            // update endpoint exists: PATCH /api/faculty/updatefaculty-status/:id
            await api.patch(`/faculty/updatefaculty-status/${f._id}`, {
                isActive: !f.isActive,
            });
            toast.success(`Faculty ${f.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchFaculty();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update faculty status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                            <Plus size={16} className="text-emerald-600" />
                        </span>
                        Faculty
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">{faculty.length} faculty member(s)</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-400 sm:w-52"
                        />
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Faculty</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 size={28} className="mr-3 animate-spin" /> Loading faculty...
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <p className="font-medium">No faculty found</p>
                    <p className="mt-1 text-sm">Create faculty for your department</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-6 py-3 text-left font-semibold">#</th>
                                <th className="px-6 py-3 text-left font-semibold">Name</th>
                                <th className="px-6 py-3 text-left font-semibold">Email</th>
                                <th className="px-6 py-3 text-left font-semibold">Status</th>
                                <th className="px-6 py-3 text-left font-semibold">Action</th>
                                <th className="px-6 py-3 text-left font-semibold">Assign</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((f, idx) => (
                                <tr key={f._id} className="transition hover:bg-emerald-50/30">
                                    <td className="px-6 py-4 font-medium text-gray-400">{idx + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{f.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{f.email}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${f.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {f.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleFacultyStatus(f)}
                                            disabled={updatingId === f._id}
                                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${f.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                        >
                                            {updatingId === f._id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : f.isActive ? (
                                                <XCircle size={12} />
                                            ) : (
                                                <CheckCircle size={12} />
                                            )}
                                            {f.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Assignment UI is handled in SubjectsTable via dropdown; we still expose callback for future */}
                                        <button
                                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                                            onClick={() => onAssignToSubject?.(f)}
                                            type="button"
                                        >
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreate && (
                <CreateFacultyModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={fetchFaculty}
                />
            )}
        </div>
    );
};

export default FacultyTable;

