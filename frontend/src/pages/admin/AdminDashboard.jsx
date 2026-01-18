
import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Wrench, LogOut, HardHat, 
  TrendingUp, Clock, History, BarChart3, ShieldCheck, DollarSign, Car, Wallet
} from 'lucide-react';
import StaffManagement from './StaffManagement';
import TechnicianManagement from './TechnicianManagement';
import Billing from '../staff/Billing';
import NotificationModal from '../../components/NotificationModal';

const AdminDashboard = () => {
    const { logout, showConfirmation, notification, closeNotification } = useGarage();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        showConfirmation(
            'Confirm Sign Out',
            'Are you sure you want to log out of your admin session?',
            () => {
                closeNotification();
                logout();
                navigate('/');
            }
        );
    };

    const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

    return (
        <div className="h-screen bg-[#f8fafc] flex text-slate-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 h-full">
                <div className="p-8 border-b border-slate-100 bg-white sticky top-0">
                    <div className="flex items-center gap-4 mb-2 group cursor-pointer">
                        <div className="relative group-hover:scale-110 transition-transform duration-300">
                             <img src="/logo.png" alt="ProGarage" className="h-10 w-auto object-contain drop-shadow-md" />
                             <div className="absolute -inset-1 bg-blue-500/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-800">ProGarage</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Admin Control</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    {[
                        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                        { to: '/admin/staff', label: 'Staff Control', icon: Users },
                        { to: '/admin/technician', label: 'Technician Hub', icon: HardHat }
                    ].map((item) => {
                        const active = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
                        return (
                            <Link 
                                key={item.to} 
                                to={item.to} 
                                className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                                    active 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-700'
                                }`}
                            >
                                <div className="flex items-center space-x-3 z-10">
                                    <item.icon size={20} className={active ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                                    <span className="font-semibold">{item.label}</span>
                                </div>
                                {active && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <button 
                        onClick={handleLogout} 
                        className="group flex items-center space-x-3 px-4 py-4 text-slate-500 font-bold hover:bg-red-50 hover:text-red-500 w-full rounded-2xl transition-all duration-300"
                    >
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-red-100 transition-colors">
                            <LogOut size={18} />
                        </div>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative p-10 h-full">
                <div className="max-w-6xl mx-auto">
                    <Routes>
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/staff/*" element={<StaffManagement />} />
                        <Route path="/technician/*" element={<TechnicianManagement />} />
                    </Routes>
                </div>
            </main>

            {notification && (
                <NotificationModal
                    isOpen={notification.isOpen}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={closeNotification}
                    onConfirm={notification.onConfirm}
                    confirmText={notification.confirmText}
                    cancelText={notification.cancelText}
                    isConfirmation={notification.type === 'confirmation'}
                />
            )}
        </div>
    );
};

const AdminHome = () => {
    const { customers, vehicles, services, invoices, staffMembers, technicians } = useGarage();
    const totalRevenue = invoices.reduce((acc, inv) => acc + (parseFloat(inv.total) || 0), 0);
    const todayServices = services.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={36} />
                        System Control
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Global oversight and administrative management.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Session</p>
                    <p className="text-lg font-bold text-slate-700">Administrator Console</p>
                </div>
            </header>

            {/* Admin Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <AdminStatsCard 
                    title="Customers" 
                    value={customers.length} 
                    icon={<Users size={24} />} 
                    color="text-blue-600" 
                    bg="bg-blue-50" 
                    barColor="bg-blue-500"
                />
                <AdminStatsCard 
                    title="Vehicles" 
                    value={vehicles.length} 
                    icon={<Car size={24} />} 
                    color="text-emerald-600" 
                    bg="bg-emerald-50"
                    barColor="bg-emerald-500" 
                />
                <AdminStatsCard 
                    title="Today's Jobs" 
                    value={todayServices} 
                    icon={<Wrench size={24} />} 
                    color="text-amber-600" 
                    bg="bg-amber-50"
                    barColor="bg-amber-500" 
                />
                <AdminStatsCard 
                    title="Team Strength" 
                    value={staffMembers.length} 
                    icon={<Users size={24} />} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50"
                    barColor="bg-indigo-500" 
                />
                <AdminStatsCard 
                    title="Shop Capacity" 
                    value={technicians.length} 
                    icon={<HardHat size={24} />} 
                    color="text-orange-600" 
                    bg="bg-orange-50"
                    barColor="bg-orange-500" 
                />
                <AdminStatsCard 
                    title="Total Revenue" 
                    value={`LKR ${totalRevenue.toLocaleString()}`} 
                    icon={<Wallet size={24} />} 
                    color="text-purple-600" 
                    bg="bg-purple-50"
                    barColor="bg-purple-500" 
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                            <History size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">System Logs</h3>
                            <p className="text-slate-500 font-medium">Recent operational milestones across all departments.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     {services.slice(-5).reverse().map((s) => (
                        <div key={s.id} className="group flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all duration-300 border border-transparent hover:border-slate-100">
                            <div className="flex items-center space-x-6">
                                <div className={`w-3 h-12 rounded-full ${s.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'} group-hover:scale-y-75 transition-transform`} />
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">Service Update: Job #{s.id}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">{s.type}</span>
                                        <span className="text-xs font-bold text-slate-500">Vehicle: {s.vehicleNumber || 'Pending'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                    s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {s.status}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">
                                    Logged at {new Date(s.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                     ))}
                     {services.length === 0 && (
                        <div className="text-center py-16">
                            <BarChart3 size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">No system activity logged in the current cycle.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

const AdminStatsCard = ({ title, value, icon, color, bg, barColor }) => (
    <div className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
        <div className="flex items-start justify-between">
            <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <div className="text-right">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black text-slate-800 mt-2">{value}</p>
            </div>
        </div>
        <div className="mt-6 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} w-0 group-hover:w-full transition-all duration-1000 delay-100`} />
        </div>
    </div>
);

export default AdminDashboard;
