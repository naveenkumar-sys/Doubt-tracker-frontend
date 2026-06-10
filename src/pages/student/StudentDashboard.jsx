import { useCallback, useEffect, useState } from 'react';
import { HelpCircle, LayoutDashboard, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';
import StudentNavbar from '../../components/layout/StudentNavbar';
import AskDoubtModal from '../../components/student/AskDoubtModal';
import BrowseDoubts from '../../components/student/BrowseDoubts';
import MyDoubtsTable from '../../components/student/MyDoubtsTable';
import DoubtDetailModal from '../../components/student/DoubtDetailModal';

const TABS = [
    { key: 'browse', label: 'Browse Queries', icon: Search },
    { key: 'myDoubts', label: 'My Queries', icon: HelpCircle },
];

const StudentDashboard = () => {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('browse');
    const [showAskModal, setShowAskModal] = useState(false);
    const [viewingDoubtId, setViewingDoubtId] = useState(null);

    const [myDoubts, setMyDoubts] = useState([]);
    const [myDoubtsLoading, setMyDoubtsLoading] = useState(false);
    const [myDoubtsSearch, setMyDoubtsSearch] = useState('');
    const [myDoubtsStatus, setMyDoubtsStatus] = useState('');
    const [myDoubtsPagination, setMyDoubtsPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

    const fetchMyDoubts = useCallback(async (page = 1) => {
        setMyDoubtsLoading(true);
        try {
            const params = { page, limit: 10, studentId: user?.id };
            if (myDoubtsStatus) params.status = myDoubtsStatus;

            const res = await api.get('/doubts/getDoubts', { params });
            const data = res.data.data;
            setMyDoubts(data?.doubts || []);
            if (data?.pagination) setMyDoubtsPagination(data.pagination);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load doubts');
        } finally {
            setMyDoubtsLoading(false);
        }
    }, [myDoubtsStatus, user]);

    useEffect(() => {
        if (activeTab === 'myDoubts') {
            fetchMyDoubts(1);
        }
    }, [activeTab, fetchMyDoubts]);

    const handleViewDoubt = (id) => setViewingDoubtId(id);

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <StudentNavbar />

            <main className="mx-auto max-w-6xl p-4 sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <LayoutDashboard size={22} className="text-purple-600" />
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Student Dashboard</h1>
                        </div>
                        <p className="text-sm text-gray-500">
                            Welcome back, {user?.name}. Search for existing answers or ask a new Qestion.
                            {user?.semester && <span className="ml-1">Semester {user.semester}.</span>}
                            <span className="ml-1">{user?.collegeName && `${user.collegeName}`}{user?.departmentName && ` - ${user.departmentName}`}.</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAskModal(true)}
                        className="inline-flex items-center  rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                    >
                        <Plus size={18} />
                        Ask a Queries
                    </button>
                </div>

                <div className="mb-6 flex w-fit gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
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

                {activeTab === 'browse' && (
                    <BrowseDoubts
                        onViewDoubt={handleViewDoubt}
                        onAskDoubt={() => setShowAskModal(true)}
                    />
                )}

                {activeTab === 'myDoubts' && (
                    <MyDoubtsTable
                        doubts={myDoubts}
                        loading={myDoubtsLoading}
                        search={myDoubtsSearch}
                        onSearchChange={setMyDoubtsSearch}
                        statusFilter={myDoubtsStatus}
                        onStatusFilterChange={(key) => { setMyDoubtsStatus(key); }}
                        pagination={myDoubtsPagination}
                        onPageChange={(page) => fetchMyDoubts(page)}
                        onViewDoubt={handleViewDoubt}
                    />
                )}
            </main>

            {showAskModal && (
                <AskDoubtModal
                    onClose={() => setShowAskModal(false)}
                    onSuccess={() => {
                        setShowAskModal(false);
                        if (activeTab === 'myDoubts') fetchMyDoubts(1);
                    }}
                />
            )}

            {viewingDoubtId && (
                <DoubtDetailModal
                    doubtId={viewingDoubtId}
                    onClose={() => setViewingDoubtId(null)}
                    onUpdate={() => {
                        if (activeTab === 'myDoubts') fetchMyDoubts(myDoubtsPagination.page);
                    }}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
