
import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
    Plus, Search, Edit2, Trash2, X, Check, AlertCircle, 
    User, Phone, Award, Power, Filter, HardHat
} from 'lucide-react';

const TechnicianManagement = () => {
    const { 
        technicians, 
        addTechnician, 
        updateTechnician, 
        deleteTechnician,
        showNotification,
        showConfirmation
    } = useGarage();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTech, setEditingTech] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        phone: '',
        is_active: true
    });

    const filteredTechs = technicians.filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.phone?.includes(searchTerm)
    );

    const handleOpenModal = (tech = null) => {
        if (tech) {
            setEditingTech(tech);
            setFormData({
                name: tech.name,
                specialization: tech.specialization || '',
                phone: tech.phone || '',
                is_active: tech.is_active ?? true
            });
        } else {
            setEditingTech(null);
            setFormData({
                name: '',
                specialization: '',
                phone: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTech(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let result;
        if (editingTech) {
            result = await updateTechnician(editingTech.id, formData);
        } else {
            result = await addTechnician(formData);
        }

        if (result.success) {
            showNotification('success', 'Success', `Technician ${editingTech ? 'updated' : 'added'} successfully`);
            handleCloseModal();
        } else {
            showNotification('error', 'Error', result.message || 'Something went wrong');
        }
    };

    const handleDelete = (tech) => {
        showConfirmation(
            'Delete Technician',
            `Are you sure you want to delete ${tech.name}? This action cannot be undone.`,
            async () => {
                const result = await deleteTechnician(tech.id);
                if (result.success) {
                    showNotification('success', 'Deleted', 'Technician removed successfully');
                } else {
                    showNotification('error', 'Error', result.message || 'Failed to delete technician');
                }
            }
        );
    };

    const toggleStatus = async (tech) => {
        const result = await updateTechnician(tech.id, { is_active: !tech.is_active });
        if (result.success) {
            showNotification('success', 'Status Updated', `${tech.name} is now ${!tech.is_active ? 'Active' : 'Inactive'}`);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <HardHat className="text-blue-600" size={36} />
                        Technician Hub
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage workshop staff, specializations, and availability.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 shadow-lg shadow-blue-200 hover:-translate-y-1"
                >
                    <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                        <Plus size={20} />
                    </div>
                    <span className="font-bold">Add New Technician</span>
                </button>
            </header>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by name, specialty, or phone..."
                        className="w-full pl-10 pr-4 py-3 bg-muted/30 border-transparent rounded-xl focus:bg-white focus:border-primary transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 bg-muted/30 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Technicians Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Technician</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialization</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Workload</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTechs.map((tech) => (
                                <tr key={tech.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {tech.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-foreground">{tech.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-amber-500" />
                                            <span>{tech.specialization || 'General'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {tech.phone || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-muted rounded-full max-w-[100px] overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all ${tech.workload > 3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(tech.workload * 20, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">{tech.workload} Jobs</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleStatus(tech)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                tech.is_active 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <Power size={12} />
                                            {tech.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => handleOpenModal(tech)}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(tech)}
                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTechs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={40} className="text-muted/50" />
                                            <p>No technicians found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
                            <h3 className="text-xl font-bold text-foreground">
                                {editingTech ? 'Edit Technician' : 'Add New Technician'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <User size={16} className="text-muted-foreground" />
                                    Full Name *
                                </label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all hover:border-muted-foreground/30"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Award size={16} className="text-muted-foreground" />
                                    Specialization
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all hover:border-muted-foreground/30"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                    placeholder="e.g. Hybrid Systems"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Phone size={16} className="text-muted-foreground" />
                                    Phone Number
                                </label>
                                <input 
                                    type="tel" 
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all hover:border-muted-foreground/30"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="e.g. +94 77 123 4567"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.is_active ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className="text-sm font-medium text-foreground">Account Active</span>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-muted/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    {editingTech ? 'Save Changes' : 'Create Technician'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianManagement;
