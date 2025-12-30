
import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, FileText, LogOut, Settings } from 'lucide-react';
import StaffManagement from './StaffManagement';

const AdminDashboard = () => {
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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col shadow-sm">
        <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ProGarage</h1>
            <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <Link to="/admin" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/admin' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
            </Link>
            <Link to="/admin/staff" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/staff') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <Users size={20} />
                <span>Staff Management</span>
            </Link>
        </nav>

        <div className="p-4 border-t border-border">
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 w-full rounded-lg transition-all">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
        <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/staff/*" element={<StaffManagement />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminHome = () => {
    const { customers, vehicles, services, invoices } = useGarage();
    const totalRevenue = invoices.reduce((acc, inv) => acc + (parseFloat(inv.totalCost) || 0), 0);
    const todayServices = services.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length;

    return (
        <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Welcome back, Admin</h2>
                    <p className="text-muted-foreground">Here's what's happening at the garage today.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <span className="font-bold">A</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Customers" value={customers.length} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
                <StatsCard title="Total Vehicles" value={vehicles.length} icon={<Wrench className="text-emerald-600" />} color="bg-emerald-50" />
                <StatsCard title="Today's Services" value={todayServices} icon={<FileText className="text-amber-600" />} color="bg-amber-50" />
                <StatsCard title="Total Revenue" value={`LKR ${totalRevenue.toLocaleString()}`} icon={<LayoutDashboard className="text-purple-600" />} color="bg-purple-50" />
 burial:
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-foreground">Recent Activity</h3>
                <div className="space-y-4">
                     {services.slice(-5).reverse().map(s => (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                            <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${s.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="font-medium text-foreground">Service for vehicle</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{new Date(s.date).toLocaleDateString()}</span>
                        </div>
                     ))}
                     {services.length === 0 && <p className="text-muted-foreground text-center py-8">No recent activity.</p>}
                </div>
            </div>
        </div>
    );
}

const StatsCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-default">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-muted-foreground text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default AdminDashboard;
