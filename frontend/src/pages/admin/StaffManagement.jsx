
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, User, Users, Trash2, Mail, AlertCircle, ShieldCheck, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';

const StaffManagement = () => {
    const { staffMembers, registerStaff, deactivateStaffMember, approveStaffMember, updateUserRole, currentUser, notification, closeNotification, showNotification, showConfirmation } = useGarage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'staff'
    });

    const pendingStaff = staffMembers?.filter(s => !s.is_approved) || [];
    const activeStaff = staffMembers?.filter(s => s.is_approved && s.is_active) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await registerStaff(formData);
            if (result.success) {
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'staff' });
                if(result.message) showNotification('success', 'Success', result.message);
            } else {
                // Display backend error message properly
                setError(result.message || 'Failed to create account');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again later.');
        }
    };

    const handleApprove = async (id) => {
        showConfirmation('Approve Staff Member', 'Are you sure you want to approve this staff member?', async () => {
            await approveStaffMember(id);
            closeNotification();
            showNotification('success', 'Approved', 'Staff member approved successfully!');
        }, 'Approve', 'Cancel');
    }

    const handleRoleChange = async (id, newRole) => {
        showConfirmation('Change User Role', `Change user role to ${newRole}?`, async () => {
            await updateUserRole(id, newRole);
            closeNotification();
            showNotification('success', 'Role Updated', `User role changed to ${newRole} successfully!`);
        }, 'Change', 'Cancel');
    }


    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={36} />
                        Staff Control
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage permissions, roles, and administrative access.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 shadow-lg shadow-blue-200 hover:-translate-y-1"
                >
                    <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                        <Plus size={20} />
                    </div>
                    <span className="font-bold">Add New Staff</span>
                </button>
            </header>

            {/* Pending Approvals Section */}
            {pendingStaff.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-amber-900">Pending Approvals</h3>
                                <p className="text-amber-700/70 text-sm font-medium">New registrations awaiting access.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingStaff.map(staff => (
                                <div key={staff.id} className="group bg-white rounded-2xl border border-amber-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                                    <div className="w-16 h-16 rounded-full bg-amber-50 mb-3 flex items-center justify-center relative group-hover:scale-110 transition-transform">
                                        <User size={30} className="text-amber-600" />
                                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                                            <AlertCircle size={14} className="text-amber-500" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800">{staff.name}</h4>
                                    <p className="text-slate-400 text-xs mb-4 font-medium">{staff.email}</p>
                                    <div className="flex gap-2 w-full">
                                        <button 
                                            onClick={() => handleApprove(staff.id)}
                                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-100 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button 
                                            onClick={() => removeStaffMember(staff.id)}
                                            className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Staff Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Verified Personnel</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeStaff.map(staff => (
                        <div key={staff.id} className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-500">
                                    <User size={40} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div className={`absolute bottom-0 right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${staff.role === 'admin' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{staff.name}</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5 mb-5 flex items-center gap-1.5 justify-center">
                                {staff.role === 'admin' ? <ShieldCheck size={10} className="text-blue-500" /> : <User size={10} />}
                                {staff.role} Rank
                            </p>
                            
                            {/* Role Toggle Switch */}
                            <div className="mb-6 w-full">
                                {currentUser?.id !== staff.id ? (
                                    <div className="flex flex-col items-center">
                                        <div 
                                            onClick={() => handleRoleChange(staff.id, staff.role === 'admin' ? 'staff' : 'admin')}
                                            className={`relative w-36 h-10 rounded-full cursor-pointer transition-all duration-500 ease-in-out flex items-center p-1.5 shadow-inner select-none ${staff.role === 'admin' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            {/* Labels Background */}
                                            <div className="absolute inset-0 flex items-center justify-between px-4 w-full h-full text-[10px] font-black uppercase tracking-widest z-0 pointer-events-none">
                                                <span className={`text-white transition-opacity duration-300 ${staff.role === 'admin' ? 'opacity-100' : 'opacity-0'}`}>
                                                    Admin
                                                </span>
                                                <span className={`text-slate-500 transition-opacity duration-300 ${staff.role === 'admin' ? 'opacity-0' : 'opacity-100'}`}>
                                                    Staff
                                                </span>
                                            </div>

                                            {/* Toggle Knob */}
                                            <div 
                                                className={`relative z-10 w-7 h-7 bg-white rounded-full shadow-lg transform transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center ${staff.role === 'admin' ? 'translate-x-[6.2rem]' : 'translate-x-0'}`}
                                            >
                                                <ShieldCheck size={14} className={`${staff.role === 'admin' ? 'text-blue-600' : 'text-slate-400'}`} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 border border-blue-100 text-blue-600 px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm inline-block">
                                        Root Access
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full text-left space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center space-x-2.5 text-slate-600">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="text-sm font-semibold truncate">{staff.email}</span>
                                </div>
                                <div className="flex items-center space-x-2.5 text-slate-600">
                                    <ShieldCheck size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Access Verified</span>
                                </div>
                            </div>

                            {currentUser?.id !== staff.id ? (
                                <button onClick={() => {
                                    showConfirmation('Revoke Access', `Are you sure you want to revoke access for ${staff.name}? Their record will be kept but they will no longer be able to log in.`, async () => {
                                        await deactivateStaffMember(staff.id);
                                        closeNotification();
                                        showNotification('success', 'Access Revoked', 'Staff member access has been revoked.');
                                    }, 'Revoke', 'Cancel');
                                }} className="group/btn w-full py-3 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center justify-center space-x-2 font-bold shadow-sm shadow-red-50">
                                    <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                    <span className="text-sm">Revoke Authorization</span>
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center space-x-2 border border-slate-200 cursor-not-allowed">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Master Key</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-2xl p-6">
                         <div className="border-b border-border pb-4 mb-4">
                            <h3 className="text-xl font-bold text-foreground">Add Staff Member</h3>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                                <input required className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Email</label>
                                <input required type="email" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50" 
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Password</label>
                                <input required type="password" className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50" 
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Role</label>
                                <select className="w-full bg-background border border-border rounded-lg p-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                     value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg">
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default StaffManagement;
