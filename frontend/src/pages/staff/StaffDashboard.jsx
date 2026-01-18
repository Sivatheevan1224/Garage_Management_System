
import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, FileText, LogOut, Car, CreditCard, History, TrendingUp, Clock } from 'lucide-react';
import CustomerManagement from './CustomerManagement';
import VehicleManagement from './VehicleManagement';
import ServiceManagement from './ServiceManagement';
import Billing from './Billing';
import NotificationModal from '../../components/NotificationModal';


const StaffDashboard = () => {
    const { logout, showConfirmation, notification, closeNotification } = useGarage();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        showConfirmation(
            'Confirm Sign Out',
            'Are you sure you want to log out of your session?',
            () => {
                closeNotification();
                logout();
                navigate('/');
            }
        );
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <div className="h-screen bg-[#f8fafc] flex text-slate-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 h-full">
                <div className="p-8 border-b border-slate-100 bg-white sticky top-0">
                    <div className="flex items-center gap-4 mb-2 group cursor-pointer">
                        <div className="relative group-hover:scale-110 transition-transform duration-300">
                            <img src="/logo.png" alt="ProGarage" className="h-10 w-auto object-contain drop-shadow-md" />
                            <div className="absolute -inset-1 bg-emerald-500/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-800">ProGarage</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Operations Hub</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    {[
                        { to: '/staff', label: 'Dashboard', icon: LayoutDashboard },
                        { to: '/staff/customers', label: 'Customers', icon: Users },
                        { to: '/staff/vehicles', label: 'Vehicles', icon: Car },
                        { to: '/staff/services', label: 'Services', icon: Wrench },
                        { to: '/staff/billing', label: 'Billing & Invoices', icon: CreditCard },
                    ].map((item) => {
                        const active = location.pathname === item.to || (item.to !== '/staff' && location.pathname.startsWith(item.to));
                        return (
                            <Link 
                                key={item.to} 
                                to={item.to} 
                                className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                                    active 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-700'
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
                        <Route path="/" element={<StaffHome />} />
                        <Route path="/customers/*" element={<CustomerManagement />} />
                        <Route path="/vehicles/*" element={<VehicleManagement />} />
                        <Route path="/services/*" element={<ServiceManagement />} />
                        <Route path="/billing/*" element={<Billing />} />
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

const StaffHome = () => {
    const { customers, services } = useGarage();
    const pendingServices = services.filter(s => s.status === 'Pending').length;
    const completedToday = services.filter(s => s.status === 'Completed' && new Date(s.date).toDateString() === new Date().toDateString()).length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Staff Overview</h2>
                    <p className="text-slate-500 mt-2 font-medium">Monitoring track-side performance and workshop status.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Date</p>
                    <p className="text-lg font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            {/* Two High Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 <div className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                    <div className="flex items-start justify-between z-10 relative">
                        <div>
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Customer Growth</h3>
                            <p className="text-5xl font-black text-slate-800 mt-3">{customers.length}</p>
                            <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit text-sm">
                                <TrendingUp size={14} />
                                <span>Total Active</span>
                            </div>
                        </div>
                        <div className="p-5 bg-white rounded-3xl shadow-inner border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                            <Users size={32} className="text-emerald-600" />
                        </div>
                    </div>
                    {/* Decorative Background Icon */}
                    <Users size={180} className="absolute -right-10 -bottom-10 text-slate-100/50 -rotate-12 pointer-events-none" />
                 </div>

                 <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden text-white">
                    <div className="flex items-start justify-between z-10 relative">
                        <div>
                            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Queue Management</h3>
                            <p className="text-5xl font-black mt-3">{pendingServices}</p>
                            <div className="flex items-center gap-2 mt-4 text-amber-400 font-bold bg-white/10 px-3 py-1 rounded-full w-fit text-sm backdrop-blur-md">
                                <Clock size={14} />
                                <span>Pending Action</span>
                            </div>
                        </div>
                        <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500">
                            <Wrench size={32} className="text-amber-400" />
                        </div>
                    </div>
                    {/* Decorative Background Icon */}
                    <Wrench size={180} className="absolute -right-10 -bottom-10 text-white/[0.03] -rotate-45 pointer-events-none" />
                 </div>
            </div>

            {/* Separate Activity Section */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <History size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Workshop Activity</h3>
                            <p className="text-slate-500 font-medium">Recent service milestones and updates.</p>
                        </div>
                    </div>
                    <Link to="/staff/services" className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                        View All <TrendingUp size={16} />
                    </Link>
                </div>

                <div className="space-y-4">
                     {services.slice(-5).reverse().map((s, idx) => (
                        <div key={s.id} className="group flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all duration-300 border border-transparent hover:border-slate-100 border-dashed border-slate-200">
                            <div className="flex items-center space-x-6">
                                <div className={`w-3 h-12 rounded-full ${s.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'} transition-all group-hover:h-3 group-hover:w-3 group-hover:rounded-lg`} />
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">Job #{s.id} - {s.type}</p>
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <Car size={14} /> {s.vehicleNumber || 'Vehicle Assigned'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                    s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {s.status}
                                </p>
                                <p className="text-xs text-slate-400 font-bold mt-2 font-mono uppercase">
                                    {new Date(s.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                     ))}

                     {services.length === 0 && (
                        <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <Car size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">The workshop queue is currently empty.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
