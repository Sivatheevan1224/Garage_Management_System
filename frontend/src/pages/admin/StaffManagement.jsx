
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, User, Trash2, Mail } from 'lucide-react';
import NotificationModal from '../../components/NotificationModal';

const StaffManagement = () => {
    const { staffMembers, registerStaff, removeStaffMember, approveStaffMember, updateUserRole, currentUser, notification, closeNotification, showNotification, showConfirmation } = useGarage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'staff'
    });

    const pendingStaff = staffMembers?.filter(s => !s.is_approved) || [];
    const activeStaff = staffMembers?.filter(s => s.is_approved) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await registerStaff(formData);
            if (result.success) {
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'staff' });
                // Refresh logic is handled in context or we can force reload if needed, but context update is better
                if(result.message) showNotification('success', 'Success', result.message);
            } else {
                setError(result.message || 'Failed to create account');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm">
                    <Plus size={18} />
                    <span>Add New Staff</span>
                </button>
            </div>

            {/* Pending Approvals Section */}
            {pendingStaff.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Pending Approvals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingStaff.map(staff => (
                            <div key={staff.id} className="bg-white rounded-xl border border-amber-100 p-6 flex flex-col items-center text-center shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-amber-100 mb-3 flex items-center justify-center">
                                    <User size={30} className="text-amber-600" />
                                </div>
                                <h4 className="text-lg font-bold text-foreground">{staff.name}</h4>
                                <p className="text-muted-foreground text-sm mb-4">{staff.email}</p>
                                <div className="flex gap-2 w-full">
                                    <button 
                                        onClick={() => handleApprove(staff.id)}
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => removeStaffMember(staff.id)}
                                        className="flex-1 bg-white border border-destructive/30 text-destructive hover:bg-destructive/5 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Staff Section */}
            <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Active Staff Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeStaff.map(staff => (
                        <div key={staff.id} className="bg-white rounded-xl border border-border p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                            <div className="w-20 h-20 rounded-full bg-muted mb-4 flex items-center justify-center">
                                <User size={40} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{staff.name}</h3>
                            
                            {/* Role Toggle Switch */}
                            <div className="mb-6 flex justify-center">
                                {currentUser?.id !== staff.id ? (
                                    <div 
                                        onClick={() => handleRoleChange(staff.id, staff.role === 'admin' ? 'staff' : 'admin')}
                                        className={`relative w-36 h-10 rounded-full cursor-pointer transition-all duration-500 ease-in-out flex items-center p-1 shadow-inner select-none ${staff.role === 'admin' ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gray-200'}`}
                                    >
                                        {/* Labels Background */}
                                        <div className="absolute inset-0 flex items-center justify-between px-3 w-full h-full text-[10px] font-extrabold uppercase tracking-widest z-0 pointer-events-none">
                                            <span className={`text-white transition-opacity duration-300 ${staff.role === 'admin' ? 'opacity-100' : 'opacity-0'}`}>
                                                Admin
                                            </span>
                                            <span className={`text-gray-500 transition-opacity duration-300 ${staff.role === 'admin' ? 'opacity-0' : 'opacity-100'}`}>
                                                Staff
                                            </span>
                                        </div>

                                        {/* Toggle Knob */}
                                        <div 
                                            className={`relative z-10 w-8 h-8 bg-white rounded-full shadow-lg transform transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center ${staff.role === 'admin' ? 'translate-x-[6.5rem]' : 'translate-x-0'}`}
                                        >
                                            <User size={16} className={`${staff.role === 'admin' ? 'text-primary' : 'text-gray-400'}`} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm">
                                        {staff.role}
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full text-left space-y-3 mb-6">
                                <div className="flex items-center space-x-3 text-muted-foreground">
                                    <Mail size={16} />
                                    <span className="text-sm">{staff.email}</span>
                                </div>
                            </div>

                            {currentUser?.id !== staff.id ? (
                                <button onClick={() => {
                                    showConfirmation('Remove Staff Member', 'Are you sure you want to remove this staff member?', async () => {
                                        await removeStaffMember(staff.id);
                                        closeNotification();
                                        showNotification('success', 'Removed', 'Staff member removed successfully!');
                                    }, 'Remove', 'Cancel');
                                }} className="w-full py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/5 transition-all flex items-center justify-center space-x-2">
                                    <Trash2 size={16} />
                                    <span>Remove Access</span>
                                </button>
                            ) : (
                                <div className="w-full py-2 border border-gray-200 text-gray-400 rounded-lg flex items-center justify-center space-x-2 bg-gray-50 cursor-not-allowed">
                                    <span className="text-sm font-medium">Current User</span>
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

            {/* Notification Modal */}
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

export default StaffManagement;
