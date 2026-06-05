import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Building2, CheckCircle, XCircle, GraduationCap, LayoutDashboard, UserCog, Plus, Users } from 'lucide-react';
import AdminNavbar from '../../components/layout/AdminNavbar';
import StatCard from '../../components/common/StatCard';
import CollegesTable from '../../components/admin/CollegesTable';
import CreateCollegeModal from '../../components/admin/CreateCollegeModal';
import DepartmentsTable from '../../components/admin/DepartmentsTable';
import CreateDepartmentModal from '../../components/admin/CreateDepartmentModal';
import CreateHodModal from '../../components/admin/CreateHodModal';

// Tabs definition
const TABS = [
    { key: 'colleges', label: 'Colleges', icon: Building2 },
    { key: 'departments', label: 'Departments', icon: GraduationCap },
    { key: 'hods', label: 'Onboard HOD', icon: UserCog },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('colleges');

    // --- Colleges State ---
    const [colleges, setColleges] = useState([]);
    // console.log(colleges);

    const [collegesLoading, setCollegesLoading] = useState(true);
    const [collegeSearch, setCollegeSearch] = useState('');
    const [showCollegeModal, setShowCollegeModal] = useState(false);
    const [updatingCollegeId, setUpdatingCollegeId] = useState(null);

    // --- Departments State ---
    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [deptSearch, setDeptSearch] = useState('');
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [updatingDeptId, setUpdatingDeptId] = useState(null);

    // --- HOD State ---
    const [showHodModal, setShowHodModal] = useState(false);

    // Fetch all colleges
    const fetchColleges = useCallback(async () => {
        setCollegesLoading(true);
        try {
            const res = await api.get('/colleges/getAllColleges');
            setColleges(res.data.data?.colleges || res.data.data || []);
        } catch {
            toast.error('Failed to load colleges');
        } finally {
            setCollegesLoading(false);
        }
    }, []);

    // Fetch all departments
    const fetchDepartments = useCallback(async () => {
        setDepartmentsLoading(true);
        try {
            const res = await api.get('/departments/getAllDepartments');
            setDepartments(res.data.data?.departments || res.data.data || []);
        } catch {
            toast.error('Failed to load departments');
        } finally {
            setDepartmentsLoading(false);
        }
    }, []);

    // Load both on mount
    useEffect(() => {
        fetchColleges();
        fetchDepartments();
    }, [fetchColleges, fetchDepartments]);

    // Toggle college active/inactive status
    const toggleCollegeStatus = async (college) => {
        setUpdatingCollegeId(college._id);
        try {
            await api.put(`/colleges/updateCollegeStatus/${college._id}`, { isActive: !college.isActive });
            toast.success(`College ${college.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchColleges();
        } catch {
            toast.error('Failed to update college status');
        } finally {
            setUpdatingCollegeId(null);
        }
    };

    // Toggle department active/inactive status
    const toggleDeptStatus = async (dept) => {
        setUpdatingDeptId(dept._id);
        try {
            await api.put(`/departments/updateDepartmentStatus/${dept._id}`, { isActive: !dept.isActive });
            toast.success(`Department ${dept.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchDepartments();
        } catch {
            toast.error('Failed to update department status');
        } finally {
            setUpdatingDeptId(null);
        }
    };

    const activeCollegesCount = colleges.filter(c => c.isActive).length;
    const activeDeptsCount = departments.filter(d => d.isActive).length;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            {/* Top Navbar */}
            <AdminNavbar />

            <main className="p-4 sm:p-8 max-w-6xl mx-auto">
                {/* Page Heading */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard size={22} className="text-blue-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Manage colleges, departments, and HODs across the platform.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Building2} label="Total Colleges" value={colleges.length} color="bg-blue-600" />
                    <StatCard icon={CheckCircle} label="Active Colleges" value={activeCollegesCount} color="bg-green-500" />
                    <StatCard icon={GraduationCap} label="Total Departments" value={departments.length} color="bg-purple-600" />
                    <StatCard icon={XCircle} label="Inactive Depts" value={departments.length - activeDeptsCount} color="bg-red-400" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Colleges */}
                {activeTab === 'colleges' && (
                    <CollegesTable
                        colleges={colleges}
                        loading={collegesLoading}
                        search={collegeSearch}
                        onSearchChange={setCollegeSearch}
                        onCreateClick={() => setShowCollegeModal(true)}
                        onToggleStatus={toggleCollegeStatus}
                        updatingId={updatingCollegeId}
                    />
                )}

                {/* Tab: Departments */}
                {activeTab === 'departments' && (
                    <DepartmentsTable
                        departments={departments}
                        loading={departmentsLoading}
                        search={deptSearch}
                        onSearchChange={setDeptSearch}
                        onCreateClick={() => setShowDeptModal(true)}
                        onToggleStatus={toggleDeptStatus}
                        updatingId={updatingDeptId}
                        colleges={colleges}
                    />
                )}

                {/* Tab: HODs */}
                {activeTab === 'hods' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="max-w-lg mx-auto text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <UserCog size={30} className="text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Onboard a Head of Department</h2>
                            <p className="text-sm text-gray-500 mb-8">
                                As the system admin, you can create HOD accounts and assign them to a specific college and department.
                                The HOD will then be responsible for adding subjects, faculty, and students within their department.
                            </p>

                            {/* Workflow Steps */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                                {[
                                    { step: '1', title: 'Choose College', desc: 'Select from active colleges', color: 'bg-blue-100 text-blue-700' },
                                    { step: '2', title: 'Choose Department', desc: 'Filtered by selected college', color: 'bg-purple-100 text-purple-700' },
                                    { step: '3', title: 'Set Credentials', desc: 'Name, email & secure password', color: 'bg-orange-100 text-orange-700' },
                                ].map(s => (
                                    <div key={s.step} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${s.color}`}>
                                            {s.step}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowHodModal(true)}
                                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                            >
                                <Plus size={18} />
                                Create HOD Account
                            </button>

                            {/* Prerequisite Warning */}
                            {(colleges.length === 0 || departments.length === 0) && (
                                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700 text-left">
                                    <strong>⚠ Prerequisite:</strong> You must have at least one active college and one active department before creating an HOD. Please go to the Colleges and Departments tabs first.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            {showCollegeModal && (
                <CreateCollegeModal
                    onClose={() => setShowCollegeModal(false)}
                    onSuccess={fetchColleges}
                />
            )}
            {showDeptModal && (
                <CreateDepartmentModal
                    onClose={() => setShowDeptModal(false)}
                    onSuccess={fetchDepartments}
                />
            )}
            
            {showHodModal && (
                <CreateHodModal
                    onClose={() => setShowHodModal(false)}
                    onSuccess={() => toast.success('HOD onboarded! They can now log in.')}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
