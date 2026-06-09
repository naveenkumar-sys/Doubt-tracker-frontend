import { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';

const AssignFacultyModal = ({ onClose, onSuccess, subject, faculty }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);

    const isSubjectMode = !!subject;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isSubjectMode) {
                    const res = await api.get('/faculty/getFaculty');
                    const allFaculty = res.data.data?.faculty || [];
                    const assignedIds = (subject.facultyIds || []).map((id) =>
                        typeof id === 'object' ? id._id.toString() : id.toString()
                    );
                    setItems(allFaculty.filter((f) => f.isActive && !assignedIds.includes(f._id.toString())));
                } else {
                    const res = await api.get(`/subjects/getSubject/${faculty.departmentId || user.departmentId}`);
                    const allSubjects = res.data.data?.subjects || [];
                    const assignedIds = (faculty.subjectIds || []).map((id) =>
                        typeof id === 'object' ? id._id.toString() : id.toString()
                    );
                    setItems(allSubjects.filter((s) => s.isActive && !assignedIds.includes(s._id.toString())));
                }
            } catch {
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (itemId) => {
        setAssigningId(itemId);
        try {
            if (isSubjectMode) {
                await api.patch(`/subjects/assignFaculty/${subject._id}`, { facultyId: itemId });
            } else {
                await api.patch(`/subjects/assignFaculty/${itemId}`, { facultyId: faculty._id });
            }
            toast.success('Assigned successfully');
            onSuccess?.();
            onClose?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign');
        } finally {
            setAssigningId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {isSubjectMode ? `Assign Faculty to ${subject.name}` : `Assign ${faculty.name} to Subject`}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            {isSubjectMode
                                ? 'Select a faculty member to assign to this subject'
                                : 'Select a subject to assign this faculty member to'}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="max-h-80 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-gray-400">
                            <Loader2 size={24} className="mr-3 animate-spin" /> Loading...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                            <p className="font-medium">No available items</p>
                            <p className="mt-1">
                                {isSubjectMode
                                    ? 'All faculty members are already assigned to this subject'
                                    : 'All subjects have this faculty assigned already'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() => handleAssign(item._id)}
                                    disabled={assigningId === item._id}
                                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left text-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                                >
                                    <div>
                                        <span className="font-medium text-gray-800">
                                            {isSubjectMode ? item.name : item.name}
                                        </span>
                                        <span className="ml-2 text-xs text-gray-400">
                                            {isSubjectMode ? item.email : `${item.code} - Sem ${item.semester}`}
                                        </span>
                                    </div>
                                    {assigningId === item._id ? (
                                        <Loader2 size={16} className="animate-spin text-emerald-600" />
                                    ) : (
                                        <Check size={16} className="text-emerald-600 opacity-0 group-hover:opacity-100" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignFacultyModal;
