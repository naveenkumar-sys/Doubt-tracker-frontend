import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CheckCircle, LayoutDashboard, Plus, Users, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';
import AdminNavbar from '../../components/layout/AdminNavbar';
import StatCard from '../../components/common/StatCard';
import CreateSubjectModal from '../../components/hod/CreateSubjectModal';
import SubjectsTable from '../../components/hod/SubjectsTable';
import FacultyTable from '../../components/hod/FacultyTable';


const TABS = [
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'faculty', label: 'Faculty', icon: Users },
    { key: 'students', label: 'Students', icon: Users },
];

const HodDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('subjects');
    const [subjects, setSubjects] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [updatingSubjectId, setUpdatingSubjectId] = useState(null);
    const [fetchCollegeName, setFetchCollegeName] = useState('');
    const [fetchDepartmentName, setFetchDepartmentName] = useState('');

    // Fqaculty state
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    // Track which faculty is being updated (activated/deactivated) to disable the button and show loader 
    const [updatingId, setUpdatingId] = useState(null);


    // Fetch college details to get the college name for display in the header
    const fetchCollege = useCallback(async (collegeId) => {
        try {
            const response = await api.get(`/colleges/getCollegeByid/${collegeId}`);
            setFetchCollegeName(response.data.data.college.name);
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load college details');
        }

    }, [user, user?.collegeId]);

    // Fetch subjects for the HOD's department on component mount and whenever the user changes (or their department changes) or when a subject is updated/created
    const fetchSubjects = useCallback(async () => {
        if (!user?.departmentId) return;

        setSubjectsLoading(true);
        try {
            const response = await api.get(`/subjects/getSubject/${user.departmentId}`);
            const fetchedSubjects = response.data.data?.subjects || [];
            setSubjects(fetchedSubjects);
            // If we got subjects and the first one has a collegeId, fetch the college details to get the college name for display
            if (fetchedSubjects.length > 0 && fetchedSubjects[0]?.collegeId) {
                fetchCollege(fetchedSubjects[0].collegeId);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load subjects');
        } finally {
            setSubjectsLoading(false);
        }
    }, [user, fetchCollege]);




    // Fetch department details to display the user's department name
    const fetchDepartment = useCallback(async (departmentId) => {
        try {
            const response = await api.get(`/departments/getDepartmentById/${departmentId}`);
            setFetchDepartmentName(response.data.data.department.name);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load department details');
        }
    }, [user, user?.departmentId]);


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSubjects();
        if (user?.departmentId) {
            fetchDepartment(user.departmentId);
        }
    }, [fetchSubjects, user?.departmentId, fetchDepartment]);


    // Toggle subject active/inactive status
    const toggleSubjectStatus = async (subject) => {
        setUpdatingSubjectId(subject._id);
        try {
            await api.patch(`/subjects/updateSubject-status/${subject._id}`, {
                isActive: !subject.isActive,
            });
            toast.success(`Subject ${subject.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchSubjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update subject status');
        } finally {
            setUpdatingSubjectId(null);
        }
    };

    const activeSubjectsCount = subjects.filter((subject) => subject.isActive).length;
    const activeFacultyCount = faculty.filter((f) => f.isActive).length;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminNavbar />

            <main className="mx-auto max-w-6xl p-4 sm:p-8">
                <div className="mb-6">
                    <div className="mb-1 flex items-center gap-2">
                        <LayoutDashboard size={22} className="text-emerald-600" />
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">HOD Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            at, {fetchCollegeName}{fetchDepartmentName ? ` • ${fetchDepartmentName}` : ''}
                        </p>

                    </div>
                    <p className="text-sm text-gray-500">
                        Manage subjects first, then create faculty and students for your department.
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard icon={BookOpen} label="Total Subjects" value={subjects.length} color="bg-emerald-600" />
                    <StatCard icon={CheckCircle} label="Active Subjects" value={activeSubjectsCount} color="bg-green-500" />
                    <StatCard icon={XCircle} label="Inactive Subjects" value={subjects.length - activeSubjectsCount} color="bg-red-400" />
                    <StatCard icon={XCircle} label="Inactive Faculty" value={faculty.length - activeFacultyCount} color="bg-red-400" />
                </div>

                <div className="mb-6 flex w-fit gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'subjects' && (
                    <SubjectsTable
                        subjects={subjects}
                        loading={subjectsLoading}
                        search={subjectSearch}
                        onSearchChange={setSubjectSearch}
                        onCreateClick={() => setShowSubjectModal(true)}
                        onToggleStatus={toggleSubjectStatus}
                        updatingId={updatingSubjectId}
                        onAssignFaculty={() => { }}
                    />
                )}



                {activeTab === 'faculty' && (
                    <div className="rounded-2xl">
                        <FacultyTable
                            faculty={faculty}
                            setFaculty={setFaculty}
                            loading={loading}
                            setLoading={setLoading}
                            search={search}
                            setSearch={setSearch}
                            showCreate={showCreate}
                            setShowCreate={setShowCreate}
                            updatingId={updatingId}
                            setUpdatingId={setUpdatingId}
                        />
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                            <Users size={30} className="text-purple-600" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">Student Management</h2>
                        <p className="mx-auto mb-6 max-w-md text-sm text-gray-500">
                            Student account creation comes after faculty setup. Students need semester data so their doubt form shows the correct subjects.
                        </p>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white opacity-60">
                            <Plus size={18} />
                            Coming Next
                        </button>
                    </div>
                )}
            </main>

            {showSubjectModal && (
                <CreateSubjectModal
                    onClose={() => setShowSubjectModal(false)}
                    onSuccess={fetchSubjects}
                />
            )}
        </div>
    );
};

export default HodDashboard;
