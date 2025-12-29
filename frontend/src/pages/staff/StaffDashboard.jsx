
import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, FileText, LogOut, Car, CreditCard, History } from 'lucide-react';
import CustomerManagement from './CustomerManagement';
import VehicleManagement from './VehicleManagement';
import ServiceManagement from './ServiceManagement';
import Billing from './Billing';


const StaffDashboard = () => {
    const { logout } = useGarage();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <div className="min-h-screen bg-background flex text-foreground font-sans">
            <aside className="w-64 bg-white border-r border-border flex flex-col shadow-sm">
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">ProGarage</h1>
                    <p className="text-xs text-muted-foreground mt-1">Staff Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/staff" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/staff' ? 'bg-emerald-50/80 text-emerald-700 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/staff/customers" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/staff/customers') ? 'bg-emerald-50/80 text-emerald-700 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                        <Users size={20} />
                        <span>Customers</span>
                    </Link>
                    <Link to="/staff/vehicles" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/staff/vehicles') ? 'bg-emerald-50/80 text-emerald-700 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                        <Car size={20} />
                        <span>Vehicles</span>
                    </Link>
                    <Link to="/staff/services" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/staff/services') ? 'bg-emerald-50/80 text-emerald-700 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                        <Wrench size={20} />
                        <span>Services</span>
                    </Link>
                    <Link to="/staff/billing" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/staff/billing') ? 'bg-emerald-50/80 text-emerald-700 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                        <CreditCard size={20} />
                        <span>Billing</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 w-full rounded-lg transition-all">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
                <Routes>
                    <Route path="/" element={<StaffHome />} />
                    <Route path="/customers/*" element={<CustomerManagement />} />
                    <Route path="/vehicles/*" element={<VehicleManagement />} />
                    <Route path="/services/*" element={<ServiceManagement />} />
                    <Route path="/billing/*" element={<Billing />} />
                </Routes>
            </main>
        </div>
    );
};

const StaffHome = () => {
    const { customers, services } = useGarage();
    const pendingServices = services.filter(s => s.status === 'Pending').length;

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Staff Dashboard</h2>
                <p className="text-muted-foreground">Manage daily operations.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-muted-foreground text-sm font-medium">Active Customers</h3>
                        <p className="text-3xl font-bold text-foreground mt-2">{customers.length}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <Users className="text-emerald-600" />
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-muted-foreground text-sm font-medium">Pending Services</h3>
                        <p className="text-3xl font-bold text-foreground mt-2">{pendingServices}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Wrench className="text-amber-600" />
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
