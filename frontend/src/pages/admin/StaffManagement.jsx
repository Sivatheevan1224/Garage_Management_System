
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, User, Trash2, Mail } from 'lucide-react';

const StaffManagement = () => {
    const { staffMembers, registerStaff, removeStaffMember } = useGarage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'staff'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await registerStaff(formData);
            if (result.success) {
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'staff' });
                // We should probably refresh the staff list here
                if (window.confirm('Account created! Awaiting admin approval. Reload to see pending?')) {
                    window.location.reload();
                }
            } else {
                setError(result.message || 'Failed to create account');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm">
                    <Plus size={18} />
                    <span>Add New Staff</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers?.map(staff => (
                    <div key={staff.id} className="bg-white rounded-xl border border-border p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                        <div className="w-20 h-20 rounded-full bg-muted mb-4 flex items-center justify-center">
                            <User size={40} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{staff.name}</h3>
                        <p className="text-primary text-sm mb-4 px-2 py-1 bg-primary/10 rounded-full">{staff.role.toUpperCase()}</p>
                        
                        <div className="w-full text-left space-y-3 mb-6">
                            <div className="flex items-center space-x-3 text-muted-foreground">
                                <Mail size={16} />
                                <span className="text-sm">{staff.email}</span>
                            </div>
                        </div>

                         <button onClick={async () => {
                             if(window.confirm('Are you sure you want to remove this staff member?')) {
                                 await removeStaffMember(staff.id);
                             }
                         }} className="w-full py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/5 transition-all flex items-center justify-center space-x-2">
                            <Trash2 size={16} />
                            <span>Remove Access</span>
                        </button>
                    </div>
                ))}
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
        </div>
    );
};

export default StaffManagement;
